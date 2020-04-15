const types = ["Тягач", "Рефрижератор", "Шторный", "Бортовой"]

const schema = [{
        name: "vehicleType",
        gsName: "Тип ТС",
        filterColumn: "A"
    },

    {
        name: "make",
        gsName: "Марка",
        filterColumn: "B",
        checkboxPrefix: "brand",
        filterQuotes: true
    },

    { name: "model", gsName: "Модель" },

    {
        name: "year",
        gsName: "Год выпуска",
        filterColumn: "D",
        checkboxPrefix: "year",
        filterQuotes: false
    },

    { name: "supplierPrice", gsName: "Цена поставщика" },
    { name: "location", gsName: "Регион склада" },
    { name: "url", gsName: "URL авто" },
    { name: "mileage", gsName: "Пробег" },

    {
        name: "formula",
        gsName: "Колесная формула",
        filterColumn: "J",
        checkboxPrefix: "formula",
        filterQuotes: true
    },

    { name: "hp", gsName: "Мощность двигателя" },
    { name: "seats", gsName: "Сидений" },

    {
        name: "beds",
        gsName: "Спальных мест",
        filterColumn: "M",
        checkboxPrefix: "beds",
        filterQuotes: false
    },

    {
        name: "leasePayment",
        gsName: "Лизинговый платеж 0% / 48 мес.",
        filterColumn: "S"
    },

    { name: "supplier", gsName: "Поставщик" },
    { name: "valuation", gsName: "Наша расчетная цена" },
    { name: "benefit", gsName: "Выгода" },
    { name: "recommendation", gsName: "Рекомендация" },
    { name: "minDownpayment", gsName: "Мин. аванс" },
    { name: "gear", gsName: "Тип КПП" },
    { name: "confidence", gsName: "Качество верификации" },
    { name: "result", gsName: "Верификация" }


]

var visualization;
var selectedType;
var data;
var blacklistedAds;
var app;
var dt = [];


google.load('visualization', '1', {
    packages: ['table']
});
google.setOnLoadCallback(requestData);

function requestData() {

    redrawAt = Date() + 5000; // запретить перерисовку из filterChanged на 5 секундн

    //init filters from URL

    var s = location.search.match(/VehicleType=(\d*)/) // ищем параметр VehicleType
    selectedType = s && s.length > 0 ? Number(s[1] - 1) : 0
    selectedType = (selectedType < 0) || (selectedType > 3) ? 0 : selectedType

    $('[name=VehicleType]').get()[selectedType].checked = true;

    var checkboxes = Object.entries(getUrlVars()).filter(e => e[1] == "on");
    checkboxes.forEach(e => { $(`[name=${e[0]}]`).get()[0].checked = true });

    // обнулять и дизейблить остальные фильтры, если выбраны полуприцепы

    if (selectedType > 0)
        trailersClicked();

    var query = new google.visualization.Query('https://spreadsheets.google.com/tq?key=1Hcc4ay2SZu1gImUljdbTVgw3GEaJrz-7IerNWcZDRzU&output=html&usp=sharing');

    filter = `WHERE (A="${types[selectedType]}")`;

    var brandTranslation = {
        "MAZ": "МАЗ",
        "KAMAZ": "КамАЗ",
        "MERCEDES": "Mercedes-Benz",
        "VOLVO": "Volvo",
        "SCANIA": "Scania",
        "RENAULT": "Renault"
    }

    schema.filter(e => e.checkboxPrefix).forEach(group => { // для каждой группы объявлений
        var inputs = $(`[name ^= "${group.checkboxPrefix}"]:checked`).get(); // загоняем в inputs названия элементов с галочками
        if (inputs.length > 0) {
            var groupFilter = "";
            inputs.forEach(e => {
                var s = e.name.match(`${group.checkboxPrefix}(.*)`)[1]; // выбрасываем название группы, оставляем значение для фильтрации
                if ((group.checkboxPrefix == "brand") && (brandTranslation[s]))
                    s = brandTranslation[s]; // переводим бренды в вид, в котором они в базе
                if (group.filterQuotes)
                    s = `"${s}"`;
                if (groupFilter == "")
                    groupFilter = `(${group.filterColumn} = ${s})`
                else
                    groupFilter = `${groupFilter} OR (${group.filterColumn} = ${s})`
            });
            filter = `${filter} AND (${groupFilter})`
        }
    });

    if ($('[name = "leasingOnly"]')[0].checked)
        filter = `${filter} AND (${schema.find(el => el.name == "leasePayment").filterColumn} > 0)`

    queryString = `SELECT * ${filter} LIMIT 40`
    console.log(queryString);
    firebase.analytics().logEvent('search', { search_term: queryString });
    query.setQuery(queryString);
    query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
    if (response.isError()) {
        alert('There was a problem with your query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }
    data = response.getDataTable();
    drawData();
}

function drawData() {

    // загоняем в таблу
    if (data.getNumberOfRows() > 0) {
        for (var r = 0; r < data.getNumberOfRows(); r++) {
            var row = new Object;
            for (var c = 0; c < data.getNumberOfColumns(); c++) {
                try {
                    key = schema.find(e => e.gsName == data.getColumnLabel(c)).name
                    let v = data.getValue(r, c)
                    if (typeof v == "number")
                        v = new Intl.NumberFormat("ru-ru").format(v)
                    row[key] = v
                } catch (err) {
                    console.log(`Не смогли найти ключ ${data.getColumnLabel(c)}`)
                }

            }
            row.visible = true
            row.checked = false
            dt.push(row);
        }
    }

    dt.forEach(el => checkVisibility(el))

    app = new Vue({
        el: "#results",
        data: {
            cards: dt,
            title: "",
            width: window.innerWidth
        },
        computed: {
            visibleCards: function() {
                vc = []
                for (let i = 0;
                    (vc.length < 20) && (i < this.cards.length); i++)
                    if (this.cards[i].visible)
                        vc.push(this.cards[i])

                const titleEndings = [
                    ' самое выгодное объявление',
                    ' самых выгодных объявления',
                    ' самых выгодных объявлений'
                ]

                let l = vc.length

                if (l == 1)
                    this.title = l.toString() + titleEndings[0]
                else if ((l > 1) && (l < 5))
                    this.title = l.toString() + titleEndings[1]
                else
                    this.title = l.toString() + titleEndings[2]

                return vc
            }
        }
    })

    loadNextVerificationResult();
}

function loadNextVerificationResult() {

    // для экономии квоты по запросам к firestore вываливаемся, когда все видимые карточки проверены

    if (dt.filter(dt_el => dt_el.checked && dt_el.visible).length >= 20) {
        console.log(`${dt.filter(e => e.checked).length} checked to provide ${Math.min (20, dt.filter(e => e.visible).length)} visible cards`)
        return;
    }

    var el = dt.find(el => !el.checked)

    if (el) {
        var docName = encodeURIComponent(el.url)
        db.collection(`ads/${docName}/verifications`) // берем одну последнюю по дате человеческую проверку
            .where('confidence', '==', 1)
            .orderBy('date', 'desc')
            .limit(1)
            .get() // возможно, в будущем использовать локальный кэш - https://firebase.google.com/docs/reference/js/firebase.firestore.GetOptions
            .then(function(QuerySnapshot) {

                if (!QuerySnapshot.empty) {

                    // записываем результат в dt

                    el.result = QuerySnapshot.docs[0].data().result;

                    checkVisibility(el);
                }

                el.checked = true;

                loadNextVerificationResult(); // этого проверили, берем следующего
            })
            .catch(function(error) {
                console.log("Error getting the document: ", error);
            });
    } else {
        console.log(`${dt.filter(e => e.checked).length} checked to provide ${Math.min (20, dt.filter(e => e.visible).length)} visible cards`)
    }
}

function checkVisibility(el) {
    if (el.result && !['ok', 'unclear', 'no_vat', 'no_vat_ever'].find(e => e == el.result))
        el.visible = false;
    if (($('[name = "leasingOnly"]')[0].checked) && el.result && (['no_vat', 'no_vat_ever'].find(e => e == el.result)))
        el.visible = false;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function trailersClicked() {
    $(".disableForTrailers .form-check-input").get().forEach(e => {
        e.disabled = true;
        e.checked = false;
    })

    $(".disableForTrailers").get().forEach(e => {
        e.hidden = true;
    })

}

function trucksClicked() {
    $(".disableForTrailers .form-check-input").get().forEach(e => {
        e.disabled = false;
    })

    $(".disableForTrailers").get().forEach(e => {
        e.hidden = false;
    })

}

function copyUrlToClipboard() {
    var dummy = document.createElement('input'),
        text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);


}

function subscribe() {

    form = $("#subcription_form")[0];
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }


    var e = $('#email').get()[0].value
    var t = getUrlVars()
    var d = new Date()

    db.collection("subscribers").add({
            date: Date.now(),
            dateString: d.toGMTString(),
            email: e,
            terms: t
        })
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            firebase.analytics().logEvent('sign_up', { method: "subscribe form" });
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
            firebase.analytics().logEvent('error');

        })
}

function filterChanged() {
    redrawAt = Date.now() + 2999;
    setTimeout(function() {
        if (Date.now() > redrawAt)
            $("#form").submit();
    }, 3000)
}
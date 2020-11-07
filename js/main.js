console.debug('main.js запускается')

const types = ["Тягач", "Рефрижератор", "Шторный", "Бортовой"]

var schema = [{
        name: "vehicleType",
        gsName: "Тип ТС",
    },

    {
        name: "brand",
        gsName: "Марка",
        checkboxPrefix: "brand",
        filterQuotes: true
    },

    { name: "model", gsName: "Модель" },

    {
        name: "year",
        gsName: "Год выпуска",
        checkboxPrefix: "year",
        filterQuotes: false
    },

    {
        name: "supplierPrice",
        gsName: "Цена поставщика",
    },

    { name: "location", gsName: "Регион склада" },
    { name: "url", gsName: "URL авто" },
    { name: "mileage", gsName: "Пробег" },

    {
        name: "formula",
        gsName: "Колесная формула",
        checkboxPrefix: "formula",
        filterQuotes: true
    },

    { name: "hp", gsName: "Мощность двигателя" },
    { name: "seats", gsName: "Сидений" },

    {
        name: "beds",
        gsName: "Спальных мест",
        checkboxPrefix: "beds",
        filterQuotes: false
    },

    {
        name: "leasePayment",
        gsName: "Лизинговый платеж 0% / 48 мес.",
    },

    { name: "supplier", gsName: "Поставщик" },
    { name: "valuation", gsName: "Наша расчетная цена" },
    { name: "benefit", gsName: "Выгода" },
    { name: "recommendation", gsName: "Рекомендация" },
    { name: "minDownpayment", gsName: "Мин. аванс" },
    { name: "gear", gsName: "Тип КПП" },
    { name: "confidence", gsName: "Качество верификации" },
    { name: "result", gsName: "Верификация" },

    {
        name: "federal_district",
        gsName: "Федеральный округ",
        checkboxPrefix: "federal_district",
        filterQuotes: true
    }


]

const WEBHOOK = 'https://docs.google.com/spreadsheets/d/1Hcc4ay2SZu1gImUljdbTVgw3GEaJrz-7IerNWcZDRzU/gviz/tq?'

var visualization;
var data;
var blacklistedAds;
var dt = [];

google.charts.load('47', { 'packages': ['table'] });
google.setOnLoadCallback(requestData);

console.debug('Ждем загрузки google charts')

async function requestData() {

    console.debug('Запущен requestData()')

    redrawAt = Date() + REDRAW_DELAY; // запретить перерисовку из filterChanged на 5 секунд

    await findColumns();

    let queryString = prepareQueryString();

    firebase.analytics().logEvent('search', { search_term: queryString });
    data = await getDataTable(WEBHOOK + 'gid=0&headers=1&tq=' + encodeURIComponent(queryString));

    drawData();
}


function prepareQueryString() {
    let filter = `WHERE (${schema[0].filterColumn}="${types[selectedType]}")`;

    schema.filter(e => e.checkboxPrefix).forEach(group => {
        var inputs = $(`[name ^= "${group.checkboxPrefix}"]:checked`).get(); // загоняем в inputs названия элементов с галочками
        if (inputs.length > 0) {
            var groupFilter = "";
            inputs.forEach(e => {
                var s = e.name.match(`${group.checkboxPrefix}(.*)`)[1]; // выбрасываем название группы, оставляем значение для фильтрации
                filterSchema.groups.filter(e => e.groupName == group.name)
                    .forEach(g => {
                        filterSchemaItem = g.items.find(e => e.name == s);
                        if (filterSchemaItem && filterSchemaItem.dbName)
                            s = filterSchemaItem.dbName;
                    });
                if (group.filterQuotes)
                    s = `"${s}"`;
                if (groupFilter == "")
                    groupFilter = `(${group.filterColumn} = ${s})`;

                else
                    groupFilter = `${groupFilter} OR (${group.filterColumn} = ${s})`;
            });
            filter = `${filter} AND (${groupFilter})`;
        }
    });

    if ($('[name = "leasingOnly"]')[0].checked)
        filter = `${filter} AND (${schema.find(el => el.name == "leasePayment").filterColumn} > 0)`;

    filter += ` AND (${schema.find(el => el.name == "supplierPrice").filterColumn} <= ${$("#maxprice")[0].value})`;

    let queryString = `SELECT * ${filter} LIMIT 40`;
    console.debug(queryString);

    return queryString
}


async function findColumns() {
    var headerTable = await getDataTable(WEBHOOK + 'gid=0&headers=0&range=' + encodeURIComponent('1:1'))
    for (let col = 0; col < headerTable.getNumberOfColumns(); col++) {
        const colLiterals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let colName = headerTable.getValue(0, col)
        if (colName) {
            let schemaElement = schema.find(e => e.gsName == colName)
            if (schemaElement)
                schemaElement.filterColumn = colLiterals[col]
        }
    }

    let orphanCols = schema.filter(e => e.checkboxPrefix && !e.filterColumn)
    if (orphanCols.length > 0)
        alert(orphanCols.length + ' столбцов фильтра не найдено')
    firebase.analytics().logEvent('error'); // TODO:не уверен, что это работает
}


async function getDataTable(queryString) {
    var query = new google.visualization.Query(queryString)
    return new Promise((resolve, reject) => {
        query.send(response => {
            if (response.isError()) {
                var el = document.createElement('html');
                el.innerHTML = response.getDetailedMessage();
                alert('There was a problem with your query: ' + response.getMessage() + ' ' + el.textContent);
                return;
            } else
                resolve(response.getDataTable())
        })
    })
}


function drawData() {

    ym(61556533, "hit", location.href);

    // обнуляем
    if (dt.length > 0)
        dt.splice(0);

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
                    console.debug(`Не смогли найти ключ ${data.getColumnLabel(c)}`)
                }

            }
            row.visible = true
            row.checked = false
            dt.push(row);
        }
    }

    dt.forEach(el => checkVisibility(el))

    if (!app)
        app = new Vue({
            el: "#results",
            data: {
                cards: dt,
                title: "",
                width: window.innerWidth,
                loading: false
            },
            computed: {
                visibleCards: function() {
                    vc = []
                    for (let i = 0;
                        (vc.length < 20) && (i < this.cards.length); i++)
                        if (this.cards[i].visible) {
                            let card = this.cards[i]
                                // убираем пробелы из числовых обозначений модели
                            let model = card.model
                            if (model)
                                card.model = card.model.replace(/(?<=\d)\s(?=\d)/, '')

                            vc.push(card)
                        }

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
            },

            methods: {
                cardClicked: function(c, index) {
                    firebase.analytics().logEvent('select_content', {
                        content_type: (c.result ? 'card_verified' : 'card_unverified'),
                        content_id: index,
                        items: [{ name: c.result ? c.result : 'unverified' }]
                    });
                }
            }
        })
    else
        app.loading = false

    loadNextVerificationResult();
}

function loadNextVerificationResult() {

    // для экономии квоты по запросам к firestore вываливаемся, когда все видимые карточки проверены

    if (dt.filter(dt_el => dt_el.checked && dt_el.visible).length >= 20) {
        console.debug(`${dt.filter(e => e.checked).length} checked to provide ${Math.min (20, dt.filter(e => e.visible).length)} visible cards`)
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
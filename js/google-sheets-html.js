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

    { name: "supplier", gsName: "Поставщик" },
    { name: "valuation", gsName: "Наша расчетная цена" },
    { name: "benefit", gsName: "Выгода" },
    { name: "recommendation", gsName: "Рекомендация" },
    { name: "minDownpayment", gsName: "Мин. аванс" },
    { name: "leasePayment", gsName: "Лизинговый платеж 0% / 48 мес." },
    { name: "gear", gsName: "Тип КПП" }


]

var visualization;
var selectedType
var data

google.load('visualization', '1', {
    packages: ['table']
});
google.setOnLoadCallback(requestData);

function requestData() {

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

    var checkboxFilter = [
        { name: "year", column: "`Год выпуска`", quotes: false },
        { name: "brand", column: "`Марка`", quotes: true },
        { name: "formula", column: "`Колесная формула`", quotes: true },
        { name: "beds", column: "`Спальных мест`", quotes: false }
    ]

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

    queryString = `SELECT * ${filter} LIMIT 20`
    console.log(queryString);
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

    if (data.getNumberOfRows() > 0) {
        // Create a formatter.
        // This example uses object literal notation to define the options.
        const delims = new google.visualization.NumberFormat({ pattern: "#,###" });

        // Форматируем данные

        for (var i = 0; i < data.getNumberOfColumns(); i++)
            if (data.getColumnType(i) == "number")
                delims.format(data, i)

            // загоняем в таблу

        var dt = [];
        for (var r = 0; r < data.getNumberOfRows(); r++) {
            var row = new Object;
            for (var c = 0; c < data.getNumberOfColumns(); c++) {
                try {
                    key = schema.find(e => e.gsName == data.getColumnLabel(c)).name
                    row[key] = data.getFormattedValue(r, c)
                } catch (err) {
                    console.log(`Не смогли найти ключ ${data.getColumnLabel(c)}`)
                }

            }
            dt.push(row)
        }

        var t = $("#table")[0];
        t.innerHTML = "";

        dt.forEach(r => {
            var d = document.createElement("div");
            d.className = "col"
            var s = `
                <div class="card mx-2 my-2">
                <div class="card-body" onclick=" { 
                    ym(61556533, 'reachGoal', 'table_click')
                    ga('send', 'event', { 
                        eventCategory: 'Outbound Link', 
                        eventAction: 'click', 
                        eventLabel: event.target.href 
                    }); 
                    if (window.innerWidth > 480)
                        window.open('${r.url}', '_blank')
                    else
                        location.href = '${r.url}'}"> 
                
                    <h3 class="card-title">
                        <a href='${r.url}'>
                            ${r.make} ${r.model}
                        </a>
                    </h3>
                    
                    <div class="my-2">
                        <small style="line-height: 1.7em; card-text">
                            ${desc(r.year.replace(/\s/g, ""), "г.в.")}
                            ${desc(r.mileage, "км")}
                    `
            if (selectedType == 0)
                s = `${s}
                            ${desc(r.gear, "")}
                            ${desc(r.formula, "")}
                            ${desc(r.hp.replace(/\s/g, ""), "л.с.")}
                            ${desc(r.beds, "сп. м.")}
                        `

            s = `${s}
                            ${desc(r.location, "")}
                        </small>
                    </div>
                    <div class="my-2 px-1">
                        <div class="card-text text-nowrap my-2">
                            <b class="text-muted">Выгода: </b>
                            <b><span class="p-1 text-white 
                            ${Number(r.benefit.replace (/[\,\s]/g, ''))>0 ? "bg-warning" : "bg-danger"} 
                            ">${r.benefit} р.</span></b>
                        </div>
                        <div class="card-text text-nowrap">
                            <b class="text-muted">Цена: </b>${r.supplierPrice} р.
                        </div>
                `

            if (r.leasePayment != "")
                s = `${s}
                        <div class="card-text text-nowrap">
                            <b class="text-muted">Лизинг: </b>${r.leasePayment} р./мес.
                        </div>
                `

            s = `${s}
                    </div>

                </div>
                </div>
                `
            d.innerHTML = s
            t.appendChild(d);
        })
        t.innerHTML = `
                <div class="row">
                    ${t.innerHTML}
                </div>
            
            `


        //поправляем в заголовке кол-во объявлений

        $("#rowNo")[0].innerHTML = String(data.getNumberOfRows())

    } else {
        $("#status")[0].innerHTML =
            "К сожалению, заданным условиям не удовлетворяет ни одно объявление. Проверьте правильность настроек фильтра.";
        $("#status")[0].className = "text-danger"
    }
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

function desc(v, a) {
    return !v ? "" :
        `<span class="mx-1 px-1 bg-light text-nowrap">${a == "" ? v : v + " " + a}</span>`
}
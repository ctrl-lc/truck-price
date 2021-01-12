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

const filterSchema = {
    groups: [{
            groupName: 'VehicleType',
            groupTitle: 'Выберите тип транспортного средства',
            groupType: 'radio',
            items: [{
                    name: 1,
                    title: "Седельный тягач"
                },
                {
                    name: 2,
                    title: "Полуприцеп-рефрижератор"
                },
                {
                    name: 3,
                    title: "Шторный полуприцеп"
                },
                {
                    name: 4,
                    title: "Бортовой полуприцеп"
                }
            ]
        },
        {
            groupName: 'year',
            groupTitle: 'Год выпуска',
            groupType: 'checkbox',
            items: [{
                    name: 2020,
                    title: "2020 г.в."
                },
                {
                    name: 2019,
                    title: "2019 г.в."
                },
                {
                    name: 2018,
                    title: "2018 г.в."
                },
                {
                    name: 2017,
                    title: "2017 г.в."
                },
                {
                    name: 2016,
                    title: "2016 г.в."
                }
            ]
        },
        {
            groupName: 'brand',
            groupTitle: 'Марка тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: 'VOLVO',
                    title: 'Volvo',
                    dbName: 'Volvo'
                },
                {
                    name: 'SCANIA',
                    title: 'Scania',
                    dbName: 'Scania'
                },
                {
                    name: 'DAF',
                    title: 'DAF'
                },
                {
                    name: 'MERCEDES',
                    title: 'Mercedes-Benz',
                    dbName: 'Mercedes-Benz'
                },
                {
                    name: 'MAN',
                    title: 'MAN'
                }
            ]
        },
        {
            groupName: 'brand',
            groupTitle: 'Марка тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: 'RENAULT',
                    title: 'Renault',
                    dbName: 'Renault'
                },
                {
                    name: 'IVECO',
                    title: 'IVECO'
                },
                {
                    name: 'KAMAZ',
                    title: 'КамАЗ',
                    dbName: 'КамАЗ'
                },
                {
                    name: 'MAZ',
                    title: 'МАЗ',
                    dbName: 'МАЗ'
                }
            ]
        },
        {
            groupName: 'formula',
            groupTitle: 'Колесная формула тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: '4x2',
                    title: '4x2'
                },
                {
                    name: '6x2',
                    title: '6x2'
                },
                {
                    name: '6x4',
                    title: '6x4'
                },
                {
                    name: '6x6',
                    title: '6x6'
                },
                {
                    name: '8x8',
                    title: '8x8'
                }
            ]
        },
        {
            groupName: 'beds',
            groupTitle: 'Спальных мест в кабине тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: '1',
                    title: '1 спальное место'
                },
                {
                    name: '2',
                    title: '2 спальных места'
                }
            ]
        },
        {
            groupName: 'federal_district',
            groupTitle: 'Федеральный округ',
            groupType: 'checkbox',
            items: [{
                    name: 'CFO',
                    title: 'Центральный ФО',
                    dbName: 'ЦФО'
                },
                {
                    name: 'SZFO',
                    title: 'Северо-Западный ФО',
                    dbName: 'СЗФО'
                },
                {
                    name: 'YUFO',
                    title: 'Южный ФО',
                    dbName: 'ЮФО'
                },
                {
                    name: 'PFO',
                    title: 'Поволжский ФО',
                    dbName: 'ПФО'
                },
                {
                    name: 'UFO',
                    title: 'Уральский ФО',
                    dbName: 'УФО'
                }
            ]
        },
        {
            groupName: 'federal_district',
            groupTitle: 'Федеральный округ',
            groupType: 'checkbox',
            items: [{
                    name: 'SFO',
                    title: 'Сибирский ФО',
                    dbName: 'СФО'
                },
                {
                    name: 'DVFO',
                    title: 'Дальневосточный ФО',
                    dbName: 'ДВФО'
                },
                {
                    name: 'SKFO',
                    title: 'Северокавказский ФО',
                    dbName: 'СКФО'
                },
                {
                    name: 'KFO',
                    title: 'Крымский ФО',
                    dbName: 'КФО'
                }
            ]
        },
        {
            groupName: 'leasingOnly',
            groupTitle: 'Только объявления с возможностью покупки в лизинг',
            groupType: 'checkbox',
            items: [{
                name: '',
                title: 'Только с возможностью лизинга'
            }]
        }
    ]
}
var ad = new Object

var docs, app

ad.username = ""
ad.decisions = [{
        decision: 'docs',
        button: 'Только ПТС',
        color: 'btn-dark',
        desc: 'Самой машины нет, продаются только документы от нее'
    },
    {
        decision: 'repairs',
        button: 'Ремонт',
        color: 'btn-dark',
        desc: 'Машина сильно повреждена, ремонт на несколько сот тысяч рублей'
    },
    {
        decision: 'mix_other',
        button: 'Другие причины / Несколько',
        color: 'btn-dark',
        desc: 'Неправильно указана марка / модель'
    },
    {
        decision: 'leasing',
        button: 'Выкуп из лизинга',
        color: 'btn-danger',
        desc: 'ТС в лизинге, его необходимо выкупать'
    },
    {
        decision: 'no_vat_ever',
        button: 'Продажа только без НДС',
        color: 'btn-danger',
        desc: 'Продажа с НДС невозможна - продает физлицо'
    },
    {
        decision: 'no_vat',
        button: 'Цена без НДС',
        color: 'btn-warning',
        desc: 'Продажа с НДС возможна, но цена будет выше ЛИБО непонятно, возможна ли продажа с НДС.'
    },
    {
        decision: 'unclear',
        button: 'Непонятно',
        color: 'btn-secondary',
        desc: 'Из объявления непонятно, есть ли НДС в цене'
    },
    {
        decision: 'ok',
        button: 'Все ОК',
        color: 'btn-success',
        desc: 'Цена с НДС, повреждений нет, лизинга нет'
    }
]
ad.alreadyChecked = []

loadDocsToCheck();

function loadDocsToCheck() {
    db.collection('ads')
        .where('checked', '==', false) // берем все непроверенные
        .get().then(function(QuerySnapshot) {
            docs = QuerySnapshot
            loadNextAd()
        }).catch(function(error) {
            console.log("Error getting documents: ", error);
        })
}

function loadNextAd() {

    // находим объявление с самой большой выгодой
    var doc
    var maxBenefit = -1000
    docs.forEach((d) => {
        if (
            (d.data().benefit > maxBenefit) &&
            (ad.alreadyChecked.indexOf(d.id) == -1)
        ) {
            doc = d
            maxBenefit = d.data().benefit
        }
    })

    // копируем все данные в ad
    Object.assign(ad, doc.data())

    ad.url = decodeURIComponent(doc.id)
    ad.docID = doc.id

    // собираем данные последней верификации
    db.collection(`ads/${doc.id}/verifications`)
        .orderBy('date', 'desc')
        .limit(1)
        .get()
        .then(v => {
            ad.result = v.docs[0].data().result
            ad.confidence = v.docs[0].data().confidence
            console.log('doc loaded: ', ad.url)
            draw();
        })
}

function draw() {
    if (!app)
        app = new Vue({
            el: '#main',
            data: ad,
            methods: {
                recordDecision: d => {
                    let usernameform = $("#usernameform")[0];
                    if (usernameform.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                        usernameform.classList.add('was-validated');
                        return;
                    }
                    r = {
                        result: d,
                        user: ad.username,
                        confidence: 1,
                        date: new Date()
                    }
                    collection(`ads/${ad.docID}/verifications`).add(r)
                    db.collection('ads').doc(ad.docID).set({ checked: true }, { merge: true })
                        .catch(function(error) {
                            console.log("Ошибка при записи свойства checked: ", error);
                        })
                    ad.alreadyChecked.push(ad.docID)
                    loadNextAd();
                }
            }
        })
}
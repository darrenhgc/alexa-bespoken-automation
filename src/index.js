'use strict';
var Alexa = require("alexa-sdk");

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var sessionStates = {};
var state = {
    initial: undefined,
    launch: 1,
    askIfPatientPregnant: 2,
    askIfPatientHasSymptoms: 3

};

function setState(stateId, context) {
    sessionStates[context.event.session.sessionId] = stateId;
}

function isState(stateId, context) {
    return sessionStates[context.event.session.sessionId] === stateId;
}



var handlers = {
    'LaunchRequest': function () {
        this.emit('NeedConsultationAboutPatientIntent');
    },
    'NeedConsultationAboutPatientIntent': function() {
        this.emit(':ask', 'Hi, do you suspect this patient has diabetes?');
        setState(state.launch, this);
    },
    'AMAZON.YesIntent': function () {
        if (isState(state.launch, this)) {
            this.emit(':ask', 'Is the patient pregnant?');
            return setState(state.askIfPatientPregnant, this);
        }
        if (isState(state.askIfPatientPregnant, this)) {
            let message = `Arrange a glucose tolerance test
Positive values
Glucose mmol/l
Fasting > 5.1
1 hour > 10.0
2 hour > 8.5
Refer to JR diabetes service if positive`;
            this.emit(':tell', message);
            return setState(state.initial, this);
        }
        if (isState(state.askIfPatientHasSymptoms, this)) {
            let message = `Check Random glucose.
• If > 11.1 mmol/l diagnose diabetes
• If <11.1 mmol/l and symptoms for > 2 months
an HbA1c can be checked.
• If HbA1c > 48 mmol/l (6.5%) this suggests
diabetes. Repeat to confirm.
• If <48 mmol/l (6.5%) seek alternative
explanation for symptoms.
• If random glucose <11.1 mmol/l and symptoms
for <2 months options are as in box for no
symptoms`;
            this.emit(':tell', message);
            return setState(state.initial, this);
        }
    },
    'AMAZON.NoIntent': function (event, context) {
        if (isState(state.launch, this)) {
            this.emit(':tell', 'Sorry I can only help with diabetes diagnoses. Goodbye!');
            return setState(state.initial, this);
        }
        if (isState(state.askIfPatientPregnant, this)) {
            this.emit(':ask', 'Symptoms attributable to diabetes e.g. polyuria, polydipsia, weight loss?');
            return setState(state.askIfPatientHasSymptoms, this);
        }
        if (isState(state.askIfPatientHasSymptoms, this)) {
            let message = `Check fasting blood glucose or HbA1c
• Fasting glucose > 7.0 mmol/l suggests
diabetes. Repeat to confirm
• HbA1c > 48mmol/l (6.5%) suggests
diabetes. Repeat to confirm`;
            this.emit(':tell', message);
            return setState(state.initial, this);
        }
    }
};
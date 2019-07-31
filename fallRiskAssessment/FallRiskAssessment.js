jQuery.sap.declare("ZHN_API_SCORES.fallRiskAssessment.FallRiskAssessment");
jQuery.sap.require("sap.ui.core.Component");
jQuery.sap.require("ZHN_API_SCORES.utils.Formatter");
sap.ui.core.Component.extend("ZHN_API_SCORES.fallRiskAssessment.FallRiskAssessment", {

    initFallRiskAssessment: function(that, patient) {
        _thatFRA = that;
        _patient = patient;
        /*{  		 Institution: "RFH1",
                 PatientId: "10005132",
                 CaseNo: "1000010460",
                 PatientName: "Test Deepakradio",
                 Sex:"Female",
                 Birthdate:"/Date(-97977600000)/",
                 PatientDoctor:"Preeti Chhabria",
                 Age:"49 years",
                 CaseType:"1",
                 DeptOu:"1ANAES",
                 Status:"",
                 DocumentNo :"",
                 DocumentType :"",
                 DocumentVersion :"",
                 DocumantPart : "",
                 Mode : "E"
	    }*/

        var _proxy = "";
        //var _proxy = "proxy/http/devnwngd.ril.com:8000";
        // Initialize service model
        var serviceUrl = _proxy + "/sap/opu/odata/sap/Z_FIORI_SCORES_PMD_SRV";
        this.oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);

        this.openDialog("FallRiskAssessmentCreate");
        this.initFallRiskAssessmentCreateDiag();
    },

    // open dialog
    openDialog: function(sName) {
        if (!this[sName]) {
            this[sName] = sap.ui.xmlfragment("ZHN_API_SCORES/fallRiskAssessment/" + sName, this);
            _thatFRA.getView().addDependent(this[sName]);
        }
        this[sName].open();
    },

    // close dialog
    onDialogclose: function(oEvent) {
        var sName = "";
        if (typeof oEvent == "object")
            sName = oEvent.getSource().getCustomData()[0].getValue();
        else
            sName = oEvent;
        this[sName].destroy();
        this[sName] = undefined;
    	var eb = sap.ui.getCore().getEventBus();
    	eb.publish("ZHN_API_SCORES", "ScoresSaveClose", {});
    },

    //create FRA dialog
    initFallRiskAssessmentCreateDiag: function() {
        var thatFRA = this;
        thatFRA.initFRATotalScore();

        var oAgeModel = new sap.ui.model.json.JSONModel({
            "AgeCollection": [{
                "Name": "Less than 60 years",
                "Value": "1"
            }, {
                "Name": "60-69 years",
                "Value": "2"
            }, {
                "Name": "70-79 years",
                "Value": "3"
            }, {
                "Name": "Greater than equal to 80 years",
                "Value": "4"
            }]
        });

        var oFHModel = new sap.ui.model.json.JSONModel({
            "FHCollection": [{
                "Name": "None",
                "Value": "0"
            }, {
                "Name": "Fall in the last 6 months",
                "Value": "5"
            }, {
                "Name": "More than 1 fall in 6 months",
                "Value": "6"
            }, {
                "Name": "Fall in hospital after admission",
                "Value": "7"
            }]
        });

        var oEBUModel = new sap.ui.model.json.JSONModel({
            "EBUCollection": [{
                "Name": "Normal limit",
                "Value": "0"
            }, {
                "Name": "Incontinence",
                "Value": "2"
            }, {
                "Name": "Urgency of frequency",
                "Value": "2"
            }, {
                "Name": "Urgency/Frequency and incontinence",
                "Value": "4"
            }]
        });

        var oMedModel = new sap.ui.model.json.JSONModel({
            "MEDCollection": [{
                "Name": "Not applicable",
                "Value": "0"
            }, {
                "Name": "On 1 high fall risk drug",
                "Value": "3"
            }, {
                "Name": "On 2 or more high fall risk drug",
                "Value": "5"
            }, {
                "Name": "Sedated procedure within past 24 hours",
                "Value": "7"
            }]
        });

        var oPCEModel = new sap.ui.model.json.JSONModel({
            "PCECollection": [{
                "Name": "Not applicable",
                "Value": "0"
            }, {
                "Name": "One present",
                "Value": "1"
            }, {
                "Name": "Two present",
                "Value": "2"
            }, {
                "Name": "3 or more present",
                "Value": "3"
            }]
        });

        var oMobModel = new sap.ui.model.json.JSONModel({
            "MOBCollection": [{
                "Name": "Normal limit",
                "Value": "0"
            }, {
                "Name": "Requires assistence or supervision for mobility, transfer or ambulation",
                "Value": "2"
            }, {
                "Name": "Unsteady gait",
                "Value": "2"
            }, {
                "Name": "Visual or auditory impairment affecting mobility",
                "Value": "2"
            }]
        });

        var oConModel = new sap.ui.model.json.JSONModel({
            "CONCollection": [{
                "Name": "Normal limit",
                "Value": "0"
            }, {
                "Name": "Altered awarness of immediate physical movement",
                "Value": "1"
            }, {
                "Name": "impulsive",
                "Value": "2"
            }, {
                "Name": "Lack of understanding of one's physical and cognitive imitation",
                "Value": "4"
            }]
        });

        sap.ui.getCore().byId("API_FRA_AGE_LIST").setModel(oAgeModel, "Age");
        sap.ui.getCore().byId("API_FRA_FH_LIST").setModel(oFHModel, "FH");
        sap.ui.getCore().byId("API_FRA_EBU_LIST").setModel(oEBUModel, "EBU");
        sap.ui.getCore().byId("API_FRA_MED_LIST").setModel(oMedModel, "MED");
        sap.ui.getCore().byId("API_FRA_PCE_LIST").setModel(oPCEModel, "PCE");
        sap.ui.getCore().byId("API_FRA_MOB_LIST").setModel(oMobModel, "MOB");
        sap.ui.getCore().byId("API_FRA_CON_LIST").setModel(oConModel, "CON");

        if (_patient.DocumentNo) {
            var sPath = "ScfRskDetailHdrSet?$filter= DocumentNumber eq '" + _patient.DocumentNo + "' and DocumentVersion eq '" + _patient.DocumentVersion + "' and DocumentType eq '" + _patient.DocumentType + "' and DocumentPart eq '" + _patient.DocumantPart + "'&$expand=SCFRSKDETAILHDRTOITEM";
            thatFRA.oModel.read(sPath, null, null, false, function(oData, oResponse) {
                    thatFRA.initFRATotalScore();
                    var selectedData = oData.results[0];
                    thatFRA.setButtonsEnability();
                    thatFRA.setSelectedDataToLists(selectedData);

                },
                function(oData, oResponse) {
                    /* failed */
                    var msg = oData.response.body;
                    msg = JSON.parse(msg);
                    msg = msg.error.message.value;
                    sap.m.MessageBox.show(msg, {
                        title: "Alert",
                        icon: sap.m.MessageBox.Icon.ERROR,
                        actions: [sap.m.MessageBox.Action.OK],
                    });
                });
        } else {
            if (_patient.Mode == "E") {
                sap.ui.getCore().byId("API_FRA_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_FRA_SAVE_BUTTON").setVisible(true);
            }
        }
    },

    //In edit and display mode, set selected data to lists
    setSelectedDataToLists: function(selectedData) {
        var thatFRA = this;
        var score = sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score["Age"].Value = selectedData.AgeValue;
        score["FallHistory"].Value = selectedData.FallHistoryValue;
        score["EBU"].Value = selectedData.EbuValue;
        score["Medication"].Value = selectedData.MedValue;
        score["PCE"].Value = selectedData.PatCareEqValue;
        score.TotalScore = selectedData.TotalScore;
        var ageList = sap.ui.getCore().byId("API_FRA_AGE_LIST");
        for (var i = 0; i < ageList.getModel("Age").getData().AgeCollection.length; i++) {
            if (selectedData.AgeValue == ageList.getModel("Age").getData().AgeCollection[i].Value) {
                ageList.setSelectedItem(ageList.getItems()[i]);
                score["Age"].Name = ageList.getModel("Age").getData().AgeCollection[i].Name;
                break;
            }
        }

        var fallHistoryList = sap.ui.getCore().byId("API_FRA_FH_LIST");
        for (var i = 0; i < fallHistoryList.getModel("FH").getData().FHCollection.length; i++) {
            if (selectedData.FallHistoryValue == fallHistoryList.getModel("FH").getData().FHCollection[i].Value) {
                fallHistoryList.setSelectedItem(fallHistoryList.getItems()[i]);
                score["FallHistory"].Name = fallHistoryList.getModel("FH").getData().FHCollection[i].Name;
                break;
            }
        }

        var ebuList = sap.ui.getCore().byId("API_FRA_EBU_LIST");
        for (var i = 0; i < ebuList.getModel("EBU").getData().EBUCollection.length; i++) {
            if (selectedData.EbuValue == ebuList.getModel("EBU").getData().EBUCollection[i].Value) {
                ebuList.setSelectedItem(ebuList.getItems()[i]);
                score["EBU"].Name = ebuList.getModel("EBU").getData().EBUCollection[i].Name;
                break;
            }
        }
        var medicationList = sap.ui.getCore().byId("API_FRA_MED_LIST");
        for (var i = 0; i < medicationList.getModel("MED").getData().MEDCollection.length; i++) {
            if (selectedData.MedValue == medicationList.getModel("MED").getData().MEDCollection[i].Value) {
                medicationList.setSelectedItem(medicationList.getItems()[i]);
                score["Medication"].Name = medicationList.getModel("MED").getData().MEDCollection[i].Name;
                break;
            }
        }
        var pceList = sap.ui.getCore().byId("API_FRA_PCE_LIST");
        for (var i = 0; i < pceList.getModel("PCE").getData().PCECollection.length; i++) {
            if (selectedData.PatCareEqValue == pceList.getModel("PCE").getData().PCECollection[i].Value) {
                pceList.setSelectedItem(pceList.getItems()[i]);
                score["PCE"].Name = pceList.getModel("PCE").getData().PCECollection[i].Name;
                break;
            }
        }
        var mobilityList = sap.ui.getCore().byId("API_FRA_MOB_LIST");
        var k = 0;
        for (var i = 0; i < 5; i++) {
            if (selectedData["MobChk" + i] == "X") {
                score["Cognition"][k++] = {
                    "Name": mobilityList.getModel("MOB").getData().MOBCollection[i].Value,
                    "Value": mobilityList.getModel("MOB").getData().MOBCollection[i].Name
                };
                mobilityList.setSelectedItem(mobilityList.getItems()[i]);
            }
        }
        var cognitionList = sap.ui.getCore().byId("API_FRA_CON_LIST");
        var j = 0;
        for (var i = 0; i < 5; i++) {
            if (selectedData["CogniChk" + i] == "X") {
                score["Cognition"][j++] = {
                    "Name": cognitionList.getModel("CON").getData().CONCollection[i].Value,
                    "Value": cognitionList.getModel("CON").getData().CONCollection[i].Name
                };
                cognitionList.setSelectedItem(cognitionList.getItems()[i]);
            }
        }
        thatFRA.onMobilityMultiSelectionChange();
        thatFRA.onCognitionMultiSelectionChange();
        sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").refresh(true);

        if (score["FallHistory"].Value == "6" || score["FallHistory"].Value == "7") {

            thatFRA.setListDisable();
            var fallHistoryList = sap.ui.getCore().byId("API_FRA_FH_LIST").getAggregation("items");
            for (var i = 0; i < fallHistoryList.length; i++) {
                fallHistoryList[i].getSingleSelectControl().setEnabled(true);
            }
            var mobilityList = sap.ui.getCore().byId("API_FRA_MOB_LIST").getSelectedItems();
            for (var i = 0; i < mobilityList.length; i++) {
                mobilityList[i].setSelected(false);
            }
            var cognitionList = sap.ui.getCore().byId("API_FRA_CON_LIST").getSelectedItems();
            for (var i = 0; i < cognitionList.length; i++) {
                cognitionList[i].setSelected(false);
            }
             score.TotalScore = 36;
        }
        sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setVisible(true);
                    sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getFRAInterpretation(parseInt(score.TotalScore)) + ")");

    },

    // setting enablity of buttons based on mode 
    setButtonsEnability: function() {
        var thatFRA = this;
        if (_patient.Mode == "E") {
            thatFRA.setListEnable();
            if (_patient.Status == "IW") {
                sap.ui.getCore().byId("API_FRA_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_FRA_SAVE_BUTTON").setVisible(true);
            } else {
                sap.ui.getCore().byId("API_FRA_RELEASE_BUTTON").setVisible(false);
                sap.ui.getCore().byId("API_FRA_SAVE_BUTTON").setVisible(false);
            }
        } else {
            thatFRA.setListDisable();
            sap.ui.getCore().byId("API_FRA_RELEASE_BUTTON").setVisible(false);
            sap.ui.getCore().byId("API_FRA_SAVE_BUTTON").setVisible(false);
        }
    },

    // FRA total score model initialisation
    initFRATotalScore: function() {
        var scoreModel = new sap.ui.model.json.JSONModel({
            "ScoreModel": [{
                "TotalScore": "",
                "Age": {
                    "Name": "",
                    "Value": ""
                },
                "FallHistory": {
                    "Name": "",
                    "Value": ""
                },
                "EBU": {
                    "Name": "",
                    "Value": ""
                },
                "Medication": {
                    "Name": "",
                    "Value": ""
                },
                "PCE": {
                    "Name": "",
                    "Value": ""
                },
                "Mobility": {
                    "Value": ""
                },
                "Cognition": {
                    "Value": ""
                }
            }]
        });
        sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").setModel(scoreModel, "ScoreModel");
        sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").bindElement("ScoreModel>/ScoreModel/0");
        sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").refresh(true);
    },

    // on change of list selection
    onSelectionChange: function(oEvent) {
        var thatFRA = this;
        var object;
        var path = oEvent.getSource().getSelectedContextPaths()[0].split("/");
        var model = path[1];
        switch (model) {
            case "AgeCollection":
                object = sap.ui.getCore().byId("API_FRA_AGE_LIST").getModel("Age").getData().AgeCollection[path[2]];
                thatFRA.modifyFRATotalScore("Age", object);
                break;
            case "FHCollection":
                object = sap.ui.getCore().byId("API_FRA_FH_LIST").getModel("FH").getData().FHCollection[path[2]];
                thatFRA.modifyFRATotalScore("FallHistory", object);
                var score = sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
                if (path[2] == "2" || path[2] == "3") {
                    thatFRA.setListDisable();

                    var fallHistoryList = sap.ui.getCore().byId("API_FRA_FH_LIST").getAggregation("items");
                    for (var i = 0; i < fallHistoryList.length; i++) {
                        fallHistoryList[i].getSingleSelectControl().setEnabled(true);
                    }
                    var ebuList = sap.ui.getCore().byId("API_FRA_EBU_LIST").getSelectedItems();
                    for (var i = 0; i < ebuList.length; i++) {
                        ebuList[i].setSelected(false);
                    }
                    score.EBU.Name = "";
                    score.EBU.Value = "";

                    var medList = sap.ui.getCore().byId("API_FRA_MED_LIST").getSelectedItems();
                    for (var i = 0; i < medList.length; i++) {
                        medList[i].setSelected(false);
                    }
                    score.Medication.Name = "";
                    score.Medication.Value = "";

                    var pceList = sap.ui.getCore().byId("API_FRA_PCE_LIST").getSelectedItems();
                    for (var i = 0; i < pceList.length; i++) {
                        pceList[i].setSelected(false);
                    }
                    score.PCE.Name = "";
                    score.PCE.Value = "";

                    var mobilityList = sap.ui.getCore().byId("API_FRA_MOB_LIST").getSelectedItems();
                    for (var i = 0; i < mobilityList.length; i++) {
                        mobilityList[i].setSelected(false);
                    }
                    score.Mobility.Name = "";
                    score.Mobility.Value = "";

                    var cognitionList = sap.ui.getCore().byId("API_FRA_CON_LIST").getSelectedItems();
                    for (var i = 0; i < cognitionList.length; i++) {
                        cognitionList[i].setSelected(false);
                    }
                    score.Cognition.Name = "";
                    score.Cognition.Value = "";

                    score.TotalScore = 36;
                    sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setVisible(true);
                    sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getFRAInterpretation(parseInt(score.TotalScore)) + ")");


                } else {
                    
                    if (score.Age.Value && (score.FallHistory.Value == "0" || score.FallHistory.Value == "5") && score.EBU.Value && score.Medication.Value && score.PCE.Value) {
                   
                    sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setVisible(true);
                    sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getFRAInterpretation(parseInt(score.TotalScore)) + ")");
                    }else{
                         score.TotalScore = "";
                    sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setVisible(false);
                    sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setText("");
                    }
                   
                    thatFRA.setListEnable();
                }
                sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").refresh(true);
                break;
            case "EBUCollection":
                object = sap.ui.getCore().byId("API_FRA_EBU_LIST").getModel("EBU").getData().EBUCollection[path[2]];
                thatFRA.modifyFRATotalScore("EBU", object);
                break;
            case "PCECollection":
                object = sap.ui.getCore().byId("API_FRA_PCE_LIST").getModel("PCE").getData().PCECollection[path[2]];
                thatFRA.modifyFRATotalScore("PCE", object);
                break;
            case "MEDCollection":
                object = sap.ui.getCore().byId("API_FRA_MED_LIST").getModel("MED").getData().MEDCollection[path[2]];
                thatFRA.modifyFRATotalScore("Medication", object);
                break;
        }
    },

    // enable lists for edit mode
    setListEnable: function(oEvent) {
        var ageList = sap.ui.getCore().byId("API_FRA_AGE_LIST").getAggregation("items");
        for (var i = 0; i < ageList.length; i++) {
            ageList[i].getSingleSelectControl().setEnabled(true);
        }
        var fallHistoryList = sap.ui.getCore().byId("API_FRA_FH_LIST").getAggregation("items");
        for (var i = 0; i < fallHistoryList.length; i++) {
            fallHistoryList[i].getSingleSelectControl().setEnabled(true);
        }
        var ebuList = sap.ui.getCore().byId("API_FRA_EBU_LIST").getAggregation("items");
        for (var i = 0; i < ebuList.length; i++) {
            ebuList[i].getSingleSelectControl().setEnabled(true);
        }
        var medicationList = sap.ui.getCore().byId("API_FRA_MED_LIST").getAggregation("items");
        for (var i = 0; i < medicationList.length; i++) {
            medicationList[i].getSingleSelectControl().setEnabled(true);
        }
        var pceList = sap.ui.getCore().byId("API_FRA_PCE_LIST").getAggregation("items");
        for (var i = 0; i < pceList.length; i++) {
            pceList[i].getSingleSelectControl().setEnabled(true);
        }
        var mobilityList = sap.ui.getCore().byId("API_FRA_MOB_LIST").getAggregation("items");
        for (var i = 0; i < mobilityList.length; i++) {
            mobilityList[i].getMultiSelectControl().setEnabled(true);
        }
        var cognitionList = sap.ui.getCore().byId("API_FRA_CON_LIST").getAggregation("items");
        for (var i = 0; i < cognitionList.length; i++) {
            cognitionList[i].getMultiSelectControl().setEnabled(true);
        }
    },

    // disable lists for display mode
    setListDisable: function(oEvent) {
        var ageList = sap.ui.getCore().byId("API_FRA_AGE_LIST").getAggregation("items");
        for (var i = 0; i < ageList.length; i++) {
            ageList[i].getSingleSelectControl().setEnabled(false);
        }
        var fallHistoryList = sap.ui.getCore().byId("API_FRA_FH_LIST").getAggregation("items");
        for (var i = 0; i < fallHistoryList.length; i++) {
            fallHistoryList[i].getSingleSelectControl().setEnabled(false);
        }
        var ebuList = sap.ui.getCore().byId("API_FRA_EBU_LIST").getAggregation("items");
        for (var i = 0; i < ebuList.length; i++) {
            ebuList[i].getSingleSelectControl().setEnabled(false);
        }
        var medicationList = sap.ui.getCore().byId("API_FRA_MED_LIST").getAggregation("items");
        for (var i = 0; i < medicationList.length; i++) {
            medicationList[i].getSingleSelectControl().setEnabled(false);
        }
        var pceList = sap.ui.getCore().byId("API_FRA_PCE_LIST").getAggregation("items");
        for (var i = 0; i < pceList.length; i++) {
            pceList[i].getSingleSelectControl().setEnabled(false);
        }
        var mobilityList = sap.ui.getCore().byId("API_FRA_MOB_LIST").getAggregation("items");
        for (var i = 0; i < mobilityList.length; i++) {
            mobilityList[i].getMultiSelectControl().setEnabled(false);
        }
        var cognitionList = sap.ui.getCore().byId("API_FRA_CON_LIST").getAggregation("items");
        for (var i = 0; i < cognitionList.length; i++) {
            cognitionList[i].getMultiSelectControl().setEnabled(false);
        }
    },

    // on mobility change
    onMobilityMultiSelectionChange: function(oEvent) {
        var mobilityList = sap.ui.getCore().byId("API_FRA_MOB_LIST");
        var totalMobVal = "";
        for (var i = 0; i < mobilityList.getSelectedItems().length; i++) {
            totalMobVal = parseInt(totalMobVal + parseInt(mobilityList.getModel("MOB").getData().MOBCollection[mobilityList.getSelectedItems()[i].getBindingContextPath().split("/")[2]].Value));
        }
        var score = sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score.Mobility.Value = totalMobVal.toString();
        if (score.Age.Value && score.FallHistory.Value && score.EBU.Value && score.Medication.Value && score.PCE.Value) {
            score.TotalScore = (parseInt(score.Age.Value) + parseInt(score.FallHistory.Value) + parseInt(score.EBU.Value) + parseInt(score.Medication.Value) + parseInt(score.PCE.Value)).toString();
            if (score.Mobility.Value)
                score.TotalScore = (parseInt(score.TotalScore) + parseInt(score.Mobility.Value)).toString();
            if (score.Cognition.Value)
                score.TotalScore = (parseInt(score.TotalScore) + parseInt(score.Cognition.Value)).toString();
            sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setVisible(true);
            sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getFRAInterpretation(parseInt(score.TotalScore)) + ")");

        } else
            score.TotalScore = "";
        sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").refresh(true);

    },

    // on cognition selection
    onCognitionMultiSelectionChange: function(oEvent) {
        var cognitionList = sap.ui.getCore().byId("API_FRA_CON_LIST");
        var totalCognVal = "";
        for (var i = 0; i < cognitionList.getSelectedItems().length; i++) {
            totalCognVal = parseInt(totalCognVal + parseInt(cognitionList.getModel("CON").getData().CONCollection[cognitionList.getSelectedItems()[i].getBindingContextPath().split("/")[2]].Value));
        }
        var score = sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score.Cognition.Value = totalCognVal.toString();
        if (score.Age.Value && score.FallHistory.Value && score.EBU.Value && score.Medication.Value && score.PCE.Value) {
            score.TotalScore = (parseInt(score.Age.Value) + parseInt(score.FallHistory.Value) + parseInt(score.EBU.Value) + parseInt(score.Medication.Value) + parseInt(score.PCE.Value)).toString();
            if (score.Mobility.Value)
                score.TotalScore = (parseInt(score.TotalScore) + parseInt(score.Mobility.Value)).toString();
            if (score.Cognition.Value)
                score.TotalScore = (parseInt(score.TotalScore) + parseInt(score.Cognition.Value)).toString();
            sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setVisible(true);
            sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getFRAInterpretation(parseInt(score.TotalScore)) + ")");

        } else
            score.TotalScore = "";
        sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").refresh(true);
    },

    // total score
    modifyFRATotalScore: function(path, object) {
        var score = sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score[path].Name = object.Name;
        score[path].Value = object.Value ? object.Value : "";
        if (score.Age.Value && score.FallHistory.Value && score.EBU.Value && score.Medication.Value && score.PCE.Value) {
            score.TotalScore = (parseInt(score.Age.Value) + parseInt(score.FallHistory.Value) + parseInt(score.EBU.Value) + parseInt(score.Medication.Value) + parseInt(score.PCE.Value)).toString();
            if (score.Mobility.Value)
                score.TotalScore = (parseInt(score.TotalScore) + parseInt(score.Mobility.Value)).toString();
            if (score.Cognition.Value)
                score.TotalScore = (parseInt(score.TotalScore) + parseInt(score.Cognition.Value)).toString();
            sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setVisible(true);
            sap.ui.getCore().byId("API_FALL_RISK_ASSESSMENT_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getFRAInterpretation(parseInt(score.TotalScore)) + ")");

        } else
            score.TotalScore = "";
        sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").refresh(true);
    },

    // on save pressed
    _handleAPIFallRiskAssesSavePressed: function() {
        var thatFRA = this;
        var score = sap.ui.getCore().byId("API_FULL_RISK_ASSESSMENT_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        if (score.FallHistory.Value) {
            var data = null;
            var totalScoreAbrValue = null;
            var totalScoreValue = score.TotalScore;
            if (score.Age.Value && (score.FallHistory.Value == "0" || score.FallHistory.Value == "5") && score.EBU.Value && score.Medication.Value && score.PCE.Value) {
                if (parseInt(totalScoreValue) <= 5) {
                    totalScoreAbrValue = "Low Risk";
                } else if (parseInt(totalScoreValue) >= 6 && parseInt(totalScoreValue) <= 13) {
                    totalScoreAbrValue = "Moderate Risk";
                } else if (parseInt(totalScoreValue) >= 14) {
                    totalScoreAbrValue = "High Risk";
                }
            } else if (score.FallHistory.Value == "6" || score.FallHistory.Value == "7") {
                score.Age.Value = "";
                score.EBU.Value = "";
                score.Medication.Value = "";
                score.PCE.Value = "";
                totalScoreValue = "36";
                totalScoreAbrValue = "High Risk";
            } else {
                sap.m.MessageToast.show("Please enter all the scores before saving.");
                return;
            }

            data = {
                DocumentType: _patient.DocumentType,
                DocumentNumber: _patient.DocumentNo,
                DocumentVersion: _patient.DocumentVersion,
                DocumentPart: _patient.DocumantPart,
                PatientName: _patient.PatientName,
                PatientMrn: _patient.PatientId,
                PatientSex: _patient.Sex,
                PatientDob: _patient.Birthdate,
                PatientDoctor: _patient.PatientDoctor,
                PatientAge: _patient.Age,
                PatientCasetype: _patient.CaseType,
                PatientCaseno: _patient.CaseNo,
                AgeScrBox: score.Age.Value,
                AgeValue: score.Age.Value,
                EbuScrBox: score.EBU.Value,
                EbuValue: score.EBU.Value,
                MedScrBox: score.Medication.Value,
                MedValue: score.Medication.Value,
                PatCareEqScrBox: score.PCE.Value,
                PatCareEqValue: score.PCE.Value,
                FallHistoryScrBox: score.FallHistory.Value,
                FallHistoryValue: score.FallHistory.Value,
                MobChk1: (sap.ui.getCore().byId("API_FRA_MOB_LIST").getItems()[1].isSelected() == true) ? "X" : "",
                MobChk2: (sap.ui.getCore().byId("API_FRA_MOB_LIST").getItems()[2].isSelected() == true) ? "X" : "",
                MobChk3: (sap.ui.getCore().byId("API_FRA_MOB_LIST").getItems()[3].isSelected() == true) ? "X" : "",
                Mobility: score.Mobility.Value,
                Cognition: score.Cognition.Value,
                CogniChk1: (sap.ui.getCore().byId("API_FRA_CON_LIST").getItems()[1].isSelected() == true) ? "X" : "",
                CogniChk2: (sap.ui.getCore().byId("API_FRA_CON_LIST").getItems()[2].isSelected() == true) ? "X" : "",
                CogniChk3: (sap.ui.getCore().byId("API_FRA_CON_LIST").getItems()[3].isSelected() == true) ? "X" : "",
                TotalScore: totalScoreValue,
                TotInte: totalScoreAbrValue,
                PmdPackag: "",
                MobChk0: (sap.ui.getCore().byId("API_FRA_MOB_LIST").getItems()[0].isSelected() == true) ? "X" : "",
                CogniChk0: (sap.ui.getCore().byId("API_FRA_CON_LIST").getItems()[0].isSelected() == true) ? "X" : "",
                MobNchk3: "",
                CogniNchk: "",
                Institution: "RFH1",
                DepartmentOu: _patient.DeptOu,
                EmployeeResp: "",
                SCFRSKDETAILHDRTOITEM: []
            };
            if (_patient.DocumentNo && _patient.Mode == "E") {
                data.Mode = "U";
            } else {
                data.Mode = "C";
            }

            thatFRA.oModel.create("/ScfRskDetailHdrSet", data, null, function(oData, oResponse) {
                thatFRA["FallRiskAssessmentCreate"].destroy();
                sap.m.MessageToast.show(oResponse.headers["sap-message"]);
                if (thatFRA.fraDirectRelease) {
                    var docNumber = oResponse.headers["sap-message"].split(" ")[2];
                    var data = {
                    		 "DocumentNumber": docNumber,
                             "DocumentType": _patient.DocumentType ? _patient.DocumentType : "MED",
                             "DocumentVersion": _patient.DocumentVersion ? _patient.DocumentVersion : "00",
                             "DocumentPart": _patient.DocumantPart ? _patient.DocumantPart : "000"
                    };
                    thatFRA.oModel.update("PmdReleaseSet('" + docNumber + "')", data, null, function(oData, oResponse) {
                            thatFRA.fraDirectRelease = false;
                            sap.m.MessageToast.show(oResponse.headers["sap-message"]);
                            var eb = sap.ui.getCore().getEventBus();
                            var returnData = {
                                    "DocumentNumber": docNumber,
                                    "DocumentType": _patient.DocumentType,
                                    "DocumentVersion": _patient.DocumentVersion,
                                    "DocumentPart": _patient.DocumantPart,
                                    "TotalScore": totalScoreValue,
                                    "Interpretation": totalScoreAbrValue
                                };
                            eb.publish("ZHN_API_SCORES", "FRARelease", returnData);
                        },
                        function(oData, oResponse) {
                            var msg = oData.response.body;
                            msg = JSON.parse(msg);
                            msg = msg.error.message.value;
                            sap.m.MessageBox.show(msg, {
                                title: "Alert",
                                icon: sap.m.MessageBox.Icon.ERROR,
                                actions: [sap.m.MessageBox.Action.OK],
                            });
                        });
                }else{
                	var eb = sap.ui.getCore().getEventBus();
                	eb.publish("ZHN_API_SCORES", "ScoresSaveClose", {});
                }

            }, function(oData, oResponse) {
                /* failed */
                var msg = oData.response.body;
                msg = JSON.parse(msg);
                msg = msg.error.message.value;
                sap.m.MessageBox.show(msg, {
                    title: "Alert",
                    icon: sap.m.MessageBox.Icon.ERROR,
                    actions: [sap.m.MessageBox.Action.OK],
                });
            });
        } else {
            sap.m.MessageToast.show("Please enter all the scores before saving.");
        }
    },

    // on release pressed
    _handleAPIFallRiskAssesReleasePressed: function() {
        var thatFRA = this;
        thatFRA.fraDirectRelease = true;
        thatFRA._handleAPIFallRiskAssesSavePressed();
        thatFRA.fraDirectRelease = false;
    }

});
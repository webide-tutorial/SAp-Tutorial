jQuery.sap.declare("ZHN_API_SCORES.braden.Braden");
jQuery.sap.require("sap.ui.core.Component");
jQuery.sap.require("ZHN_API_SCORES.utils.Formatter");
sap.ui.core.Component.extend("ZHN_API_SCORES.braden.Braden", {

    initBraden: function(that, patient) {
        _thatBS = that;
        _patient = patient;
        /*{   Institution: "RFH1",
            PatientId: "10005114",
            CaseNo: "1000010436",
            PatientName: "For PAC New Logic",
            Sex:"Female",
            Birthdate:"/Date(1454630400000)/",
            PatientDoctor:"Sameer Gaggar",
            Age:"4 months",
            CaseType:"1",
            DeptOu:"1CARDIO",
            Status:"",
            DocumentNo :"",
            DocumentType :"",
            DocumentVersion :"",
            DocumantPart : "",
            Mode : ""
	    }*/

        var _proxy = "";
        //var _proxy = "proxy/http/devnwngd.ril.com:8000";
        // Initialize service model
        var serviceUrl = _proxy + "/sap/opu/odata/sap/Z_FIORI_SCORES_PMD_SRV";
        this.oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);

        this.openDialog("BradenCreate");
        this.initBradenCreateDiag();
    },

    // open dialog
    openDialog: function(sName) {
        if (!this[sName]) {
            this[sName] = sap.ui.xmlfragment("ZHN_API_SCORES/braden/" + sName, this);
            _thatBS.getView().addDependent(this[sName]);
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

    // create braden dialog
    initBradenCreateDiag: function() {
        var thatBS = this;
        thatBS.initBradenTotalScore();

        var oSensoryPerceptionModel = new sap.ui.model.json.JSONModel({
            "SRCollection": [{
                "Name": "Completely limited",
                "Value": "1"
            }, {
                "Name": "Very limited",
                "Value": "2"
            }, {
                "Name": "Slightly limited",
                "Value": "3"
            }, {
                "Name": "No impairment",
                "Value": "4"
            }]
        });

        var oMoistureModel = new sap.ui.model.json.JSONModel({
            "MoistureCollection": [{
                "Name": "Constantly moist",
                "Value": "1"
            }, {
                "Name": "Very moist",
                "Value": "2"
            }, {
                "Name": "Ocasionally moist",
                "Value": "3"
            }, {
                "Name": "Rarely moist",
                "Value": "4"
            }]
        });

        var oActivityModel = new sap.ui.model.json.JSONModel({
            "ActivityCollection": [{
                "Name": "Bed rest",
                "Value": "1"
            }, {
                "Name": "Chairfast",
                "Value": "2"
            }, {
                "Name": "Walks ocasionally",
                "Value": "3"
            }, {
                "Name": "Walks",
                "Value": "4"
            }]
        });

        var oMobilityModel = new sap.ui.model.json.JSONModel({
            "MobilityCollection": [{
                "Name": "Completely immobile",
                "Value": "1"
            }, {
                "Name": "Very limited",
                "Value": "2"
            }, {
                "Name": "Slightly limited",
                "Value": "3"
            }, {
                "Name": "No limitations",
                "Value": "4"
            }]
        });

        var oNutritionModel = new sap.ui.model.json.JSONModel({
            "NutritionCollection": [{
                "Name": "Very poor",
                "Value": "1"
            }, {
                "Name": "Probably inadequate",
                "Value": "2"
            }, {
                "Name": "Adequate",
                "Value": "3"
            }, {
                "Name": "Excellent",
                "Value": "4"
            }]
        });

        var oFrictionShearModel = new sap.ui.model.json.JSONModel({
            "FrictionShearCollection": [{
                "Name": "Problem",
                "Value": "1"
            }, {
                "Name": "Potential Problem",
                "Value": "2"
            }, {
                "Name": "No appearent problem",
                "Value": "3"
            }]
        });

        sap.ui.getCore().byId("API_BRADEN_SP_LIST").setModel(oSensoryPerceptionModel, "SensoryPerception");
        sap.ui.getCore().byId("API_BRADEN_MOI_LIST").setModel(oMoistureModel, "Moisture");
        sap.ui.getCore().byId("API_BRADEN_ACT_LIST").setModel(oActivityModel, "Activity");
        sap.ui.getCore().byId("API_BRADEN_MOB_LIST").setModel(oMobilityModel, "Mobility");
        sap.ui.getCore().byId("API_BRADEN_NUT_LIST").setModel(oNutritionModel, "Nutrition");
        sap.ui.getCore().byId("API_BRADEN_FS_LIST").setModel(oFrictionShearModel, "FrictionShear");

        if (_patient.DocumentNo) {
        	var sPath = "BscAleDetailHdrSet(DocumentNumber='"+_patient.DocumentNo+"',DocumentVersion='"+_patient.DocumentVersion+"',DocumentType='"+_patient.DocumentType+"',DocumentPart='"+_patient.DocumantPart+"')";
           // var sPath = "BscAleDetailHdrSet?$filter= DocumentNumber eq '" + _patient.DocumentNo + "' and DocumentVersion eq '" + _patient.DocumentVersion + "' and DocumentType eq '" + _patient.DocumentType + "' and DocumentPart eq '" + _patient.DocumantPart + "'&$expand=BSCALEDETAILHDRTOITEM";
            thatBS.oModel.read(sPath, null, null, false, function(oData, oResponse) {
                    thatBS.initBradenTotalScore();
                    var selectedData = oData;
                    thatBS.setSelectedDataToLists(selectedData);
                    thatBS.setButtonsEnability();
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
                sap.ui.getCore().byId("API_BRADEN_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_BRADEN_SAVE_BUTTON").setVisible(true);
            }
        }
    },

    //In edit and display mode, set selected data to lists
    setSelectedDataToLists: function(selectedData) {
        var score = sap.ui.getCore().byId("API_BRADEN_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score["SensoryPerception"].Value = selectedData.SensaryPerception;
        score["Moisture"].Value = selectedData.Moisture;
        score["Activity"].Value = selectedData.Activity;
        score["Mobility"].Value = selectedData.Mobility;
        score["Nutrition"].Value = selectedData.Nutriition;
        score["FrictionShear"].Value = selectedData.Friction;
        score.TotalScore = selectedData.TotalScore;
        var sensoryPerceptionList = sap.ui.getCore().byId("API_BRADEN_SP_LIST");
        for (var i = 0; i < sensoryPerceptionList.getModel("SensoryPerception").getData().SRCollection.length; i++) {
            if (selectedData.SensaryPerception == sensoryPerceptionList.getModel("SensoryPerception").getData().SRCollection[i].Value) {
                sensoryPerceptionList.setSelectedItem(sensoryPerceptionList.getItems()[i]);
                score["SensoryPerception"].Name = sensoryPerceptionList.getModel("SensoryPerception").getData().SRCollection[i].Name;
                break;
            }
        }

        var moistureList = sap.ui.getCore().byId("API_BRADEN_MOI_LIST");
        for (var i = 0; i < moistureList.getModel("Moisture").getData().MoistureCollection.length; i++) {
            if (selectedData.Moisture == moistureList.getModel("Moisture").getData().MoistureCollection[i].Value) {
                moistureList.setSelectedItem(moistureList.getItems()[i]);
                score["Moisture"].Name = moistureList.getModel("Moisture").getData().MoistureCollection[i].Name;
                break;
            }
        }
        var activityList = sap.ui.getCore().byId("API_BRADEN_ACT_LIST");
        for (var i = 0; i < activityList.getModel("Activity").getData().ActivityCollection.length; i++) {
            if (selectedData.Activity == activityList.getModel("Activity").getData().ActivityCollection[i].Value) {
                activityList.setSelectedItem(activityList.getItems()[i]);
                score["Activity"].Name = activityList.getModel("Activity").getData().ActivityCollection[i].Name;
                break;
            }
        }
        var mobilitiyList = sap.ui.getCore().byId("API_BRADEN_MOB_LIST");
        for (var i = 0; i < mobilitiyList.getModel("Mobility").getData().MobilityCollection.length; i++) {
            if (selectedData.Mobility == mobilitiyList.getModel("Mobility").getData().MobilityCollection[i].Value) {
                mobilitiyList.setSelectedItem(mobilitiyList.getItems()[i]);
                score["SensoryPerception"].Name = mobilitiyList.getModel("Mobility").getData().MobilityCollection[i].Name;
                break;
            }
        }

        var nutritionList = sap.ui.getCore().byId("API_BRADEN_NUT_LIST");
        for (var i = 0; i < nutritionList.getModel("Nutrition").getData().NutritionCollection.length; i++) {
            if (selectedData.Nutriition == nutritionList.getModel("Nutrition").getData().NutritionCollection[i].Value) {
                nutritionList.setSelectedItem(nutritionList.getItems()[i]);
                score["Nutrition"].Name = nutritionList.getModel("Nutrition").getData().NutritionCollection[i].Name;
                break;
            }
        }
        var frictionShearList = sap.ui.getCore().byId("API_BRADEN_FS_LIST"); /*"{FrictionShear>/FrictionShearCollection}"*/
        for (var i = 0; i < frictionShearList.getModel("FrictionShear").getData().FrictionShearCollection.length; i++) {
            if (selectedData.Friction == frictionShearList.getModel("FrictionShear").getData().FrictionShearCollection[i].Value) {
                frictionShearList.setSelectedItem(frictionShearList.getItems()[i]);
                score["FrictionShear"].Name = frictionShearList.getModel("FrictionShear").getData().FrictionShearCollection[i].Name;
                break;
            }
        }
        sap.ui.getCore().byId("API_BRADEN_DIALOG").getModel("ScoreModel").refresh(true);
        sap.ui.getCore().byId("API_BRADEN_TOTAL").setVisible(true);
        sap.ui.getCore().byId("API_BRADEN_TOTAL").setText("Total Score :" + score.TotalScore  + " (" + ZHN_API_SCORES.utils.Formatter.getBradenInterpretation(parseInt(score.TotalScore)) + ")");
    },

    // setting enablity of buttons based on mode 
    setButtonsEnability: function() {
        var thatBS = this;
        if (_patient.Mode == "E") {
            thatBS.setListEnable();
            if (_patient.Status == "IW") {
                sap.ui.getCore().byId("API_BRADEN_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_BRADEN_SAVE_BUTTON").setVisible(true);
            } else {
                sap.ui.getCore().byId("API_BRADEN_RELEASE_BUTTON").setVisible(false);
                sap.ui.getCore().byId("API_BRADEN_SAVE_BUTTON").setVisible(false);
            }
        } else {
            thatBS.setListDisable();
            sap.ui.getCore().byId("API_BRADEN_RELEASE_BUTTON").setVisible(false);
            sap.ui.getCore().byId("API_BRADEN_SAVE_BUTTON").setVisible(false);
        }
    },

    // enable lists for edit mode
    setListEnable: function(oEvent) {
        var sensoryPerceptionList = sap.ui.getCore().byId("API_BRADEN_SP_LIST").getAggregation("items");
        for (var i = 0; i < sensoryPerceptionList.length; i++) {
            sensoryPerceptionList[i].getSingleSelectControl().setEnabled(true);
        }
        var moistureList = sap.ui.getCore().byId("API_BRADEN_MOI_LIST").getAggregation("items");
        for (var i = 0; i < moistureList.length; i++) {
            moistureList[i].getSingleSelectControl().setEnabled(true);
        }
        var activityList = sap.ui.getCore().byId("API_BRADEN_ACT_LIST").getAggregation("items");
        for (var i = 0; i < activityList.length; i++) {
            activityList[i].getSingleSelectControl().setEnabled(true);
        }
        var mobilitiyList = sap.ui.getCore().byId("API_BRADEN_MOB_LIST").getAggregation("items");
        for (var i = 0; i < mobilitiyList.length; i++) {
            mobilitiyList[i].getSingleSelectControl().setEnabled(true);
        }
        var nutritionList = sap.ui.getCore().byId("API_BRADEN_NUT_LIST").getAggregation("items");
        for (var i = 0; i < nutritionList.length; i++) {
            nutritionList[i].getSingleSelectControl().setEnabled(true);
        }
        var frictionShearList = sap.ui.getCore().byId("API_BRADEN_FS_LIST").getAggregation("items");
        for (var i = 0; i < frictionShearList.length; i++) {
            frictionShearList[i].getSingleSelectControl().setEnabled(true);
        }
    },

    // disable lists for display mode
    setListDisable: function(oEvent) {
        var sensoryPerceptionList = sap.ui.getCore().byId("API_BRADEN_SP_LIST").getAggregation("items");
        for (var i = 0; i < sensoryPerceptionList.length; i++) {
            sensoryPerceptionList[i].getSingleSelectControl().setEnabled(false);
        }
        var moistureList = sap.ui.getCore().byId("API_BRADEN_MOI_LIST").getAggregation("items");
        for (var i = 0; i < moistureList.length; i++) {
            moistureList[i].getSingleSelectControl().setEnabled(false);
        }
        var activityList = sap.ui.getCore().byId("API_BRADEN_ACT_LIST").getAggregation("items");
        for (var i = 0; i < activityList.length; i++) {
            activityList[i].getSingleSelectControl().setEnabled(false);
        }
        var mobilitiyList = sap.ui.getCore().byId("API_BRADEN_MOB_LIST").getAggregation("items");
        for (var i = 0; i < mobilitiyList.length; i++) {
            mobilitiyList[i].getSingleSelectControl().setEnabled(false);
        }
        var nutritionList = sap.ui.getCore().byId("API_BRADEN_NUT_LIST").getAggregation("items");
        for (var i = 0; i < nutritionList.length; i++) {
            nutritionList[i].getSingleSelectControl().setEnabled(false);
        }
        var frictionShearList = sap.ui.getCore().byId("API_BRADEN_FS_LIST").getAggregation("items");
        for (var i = 0; i < frictionShearList.length; i++) {
            frictionShearList[i].getSingleSelectControl().setEnabled(false);
        }
    },

    // braden total score model initialisation
    initBradenTotalScore: function() {
        var oScoreModel = new sap.ui.model.json.JSONModel({
            "ScoreModel": [{
                "TotalScore": "",
                "SensoryPerception": {
                    "Name": "",
                    "Value": ""
                },
                "Moisture": {
                    "Name": "",
                    "Value": ""
                },
                "Activity": {
                    "Name": "",
                    "Value": ""
                },
                "Mobility": {
                    "Name": "",
                    "Value": ""
                },
                "Nutrition": {
                    "Name": "",
                    "Value": ""
                },
                "FrictionShear": {
                    "Name": "",
                    "Value": ""
                },
            }]
        });
        sap.ui.getCore().byId("API_BRADEN_DIALOG").setModel(oScoreModel, "ScoreModel");
        sap.ui.getCore().byId("API_BRADEN_DIALOG").bindElement("ScoreModel>/ScoreModel/0");
        sap.ui.getCore().byId("API_BRADEN_DIALOG").getModel("ScoreModel").refresh(true);
        
    },

    // on change of list selection
    onSelectionChange: function(oEvent) {
        var thatBS = this;
        var object;
        var path = oEvent.getSource().getSelectedContextPaths()[0].split("/");
        var model = path[1];
        switch (model) {
            case "SRCollection":
                object = sap.ui.getCore().byId("API_BRADEN_SP_LIST").getModel("SensoryPerception").getData().SRCollection[path[2]];
                thatBS.modifyBradenTotalScore("SensoryPerception", object);
                break;
            case "MoistureCollection":
                object = sap.ui.getCore().byId("API_BRADEN_MOI_LIST").getModel("Moisture").getData().MoistureCollection[path[2]];
                thatBS.modifyBradenTotalScore("Moisture", object);
                break;
            case "ActivityCollection":
                object = sap.ui.getCore().byId("API_BRADEN_ACT_LIST").getModel("Activity").getData().ActivityCollection[path[2]];
                thatBS.modifyBradenTotalScore("Activity", object);
                break;
            case "MobilityCollection":
                object = sap.ui.getCore().byId("API_BRADEN_MOB_LIST").getModel("Mobility").getData().MobilityCollection[path[2]];
                thatBS.modifyBradenTotalScore("Mobility", object);
                break;
            case "NutritionCollection":
                object = sap.ui.getCore().byId("API_BRADEN_NUT_LIST").getModel("Nutrition").getData().NutritionCollection[path[2]];
                thatBS.modifyBradenTotalScore("Nutrition", object);
                break;
            case "FrictionShearCollection":
                object = sap.ui.getCore().byId("API_BRADEN_FS_LIST").getModel("FrictionShear").getData().FrictionShearCollection[path[2]];
                thatBS.modifyBradenTotalScore("FrictionShear", object);
                break;
        }
    },

    // total score
    modifyBradenTotalScore: function(path, object) {
        var score = sap.ui.getCore().byId("API_BRADEN_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score[path].Name = object.Name;
        score[path].Value = object.Value ? object.Value : "";
        if (score.SensoryPerception.Value && score.Moisture.Value && score.Activity.Value && score.Mobility.Value && score.Nutrition.Value && score.FrictionShear.Value) {
            score.TotalScore = (parseInt(score.SensoryPerception.Value) + parseInt(score.Moisture.Value) + parseInt(score.Activity.Value) + parseInt(score.Mobility.Value) + parseInt(score.Nutrition.Value) + parseInt(score.FrictionShear.Value)).toString();
            sap.ui.getCore().byId("API_BRADEN_TOTAL").setVisible(true);
            sap.ui.getCore().byId("API_BRADEN_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getBradenInterpretation(parseInt(score.TotalScore)) + ")");
        }
        sap.ui.getCore().byId("API_BRADEN_DIALOG").getModel("ScoreModel").refresh(true);
    },

    // on save pressed
    _handleAPIBradenSavePressed: function() {
        var thatBS = this;
        var score = sap.ui.getCore().byId("API_BRADEN_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        if (score.SensoryPerception.Value && score.Moisture.Value && score.Activity.Value && score.Mobility.Value && score.Nutrition.Value && score.FrictionShear.Value) {
            var data = null;
            var totalScoreAbrValue = null;
            var totalScoreValue = score.TotalScore;
            if (parseInt(totalScoreValue) <= 9) {
                totalScoreAbrValue = "Very high risk";
            } else if (parseInt(totalScoreValue) >= 10 && parseInt(totalScoreValue) <= 12) {
                totalScoreAbrValue = "High risk";
            } else if (parseInt(totalScoreValue) >= 13 && parseInt(totalScoreValue) <= 14) {
                totalScoreAbrValue = "Moderate risk";
            } else if (parseInt(totalScoreValue) >= 15 && parseInt(totalScoreValue) <= 18) {
                totalScoreAbrValue = "Mild risk";
            } else if (parseInt(totalScoreValue) >= 19) {
                totalScoreAbrValue = "No risk";
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
                PmdPackage: "",
                SensaryPerception: score.SensoryPerception.Value,
                Moisture: score.Moisture.Value,
                Activity: score.Activity.Value,
                Mobility: score.Mobility.Value,
                Nutriition: score.Nutrition.Value,
                Friction: score.FrictionShear.Value,
                TotalScore: totalScoreValue,
                InterpetatScore: totalScoreAbrValue,
                Institution: "RFH1",
                DepartmentOu: _patient.DeptOu,
                EmployeeResp: "",
                Mode: "",
            };

            if (_patient.DocumentNo && _patient.Mode == "E") {
                data.Mode = "U";
            } else {
                data.Mode = "C";
            }

            thatBS.oModel.update("/BscAleDetailHdrSet(DocumentNumber='"+_patient.DocumentNo+"',DocumentVersion='"+_patient.DocumentVersion+"',DocumentType='"+_patient.DocumentType+"',DocumentPart='"+_patient.DocumantPart+"')", data, null, function(oData, oResponse) {
                thatBS["BradenCreate"].destroy();
                sap.m.MessageToast.show(oResponse.headers["sap-message"]);
               
                if (thatBS.bradenDirectRelease) {
                    var docNumber = oResponse.headers["sap-message"].split(" ")[2];
                    var data = {
                        "DocumentNumber": docNumber,
                        "DocumentType": _patient.DocumentType ? _patient.DocumentType : "MED",
                        "DocumentVersion": _patient.DocumentVersion ? _patient.DocumentVersion : "00",
                        "DocumentPart": _patient.DocumantPart ? _patient.DocumantPart : "000"
                    };
                    thatBS.oModel.update("PmdReleaseSet('" + docNumber + "')", data, null, function(oData, oResponse) {
                    	 thatBS.bradenDirectRelease = false;
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
                            eb.publish("ZHN_API_SCORES", "BradenRelease", returnData);
                        },
                        function(oData, oResponse) {
                            thatBS.bradenDirectRelease = false;
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

    //on release pressed
    _handleAPIBradenReleasePressed: function() {
        var thatBS = this;
        thatBS.bradenDirectRelease = true;
        thatBS._handleAPIBradenSavePressed();
        thatBS.bradenDirectRelease = false;
    }
});
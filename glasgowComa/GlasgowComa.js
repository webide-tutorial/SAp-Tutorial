jQuery.sap.declare("ZHN_API_SCORES.glasgowComa.GlasgowComa");
jQuery.sap.require("sap.ui.core.Component");
jQuery.sap.require("ZHN_API_SCORES.utils.Formatter");
sap.ui.core.Component.extend("ZHN_API_SCORES.glasgowComa.GlasgowComa", {

    initGlasgowComa: function(that, patient) {
        _thatGCS = that;
        _patient = patient;
        /*{   Institution: "RFH1",
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

        this.openDialog("GlasgowComaCreate");
        this.initGlasgowComaCreateDiag();
    },

    // open dialog
    openDialog: function(sName) {
        if (!this[sName]) {
            this[sName] = sap.ui.xmlfragment("ZHN_API_SCORES/glasgowComa/" + sName, this);
            _thatGCS.getView().addDependent(this[sName]);
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

    // create glassgow coma dialog
    initGlasgowComaCreateDiag: function() {
        var thatGCS = this;
        thatGCS.initGCSTotalScore();
        var oMRModel = new sap.ui.model.json.JSONModel({
            "MRCollection": [{
                "Name": "None",
                "Value": "1"
            }, {
                "Name": "Extension posturing",
                "Value": "2"
            }, {
                "Name": "Abnormal flexion posturing",
                "Value": "3"
            }, {
                "Name": "Withdraws (Flexion)",
                "Value": "4"
            }, {
                "Name": "Localizes",
                "Value": "5"
            }, {
                "Name": "Obeys",
                "Value": "6"
            }]
        });

        var oVRModel = new sap.ui.model.json.JSONModel({
            "VRCollection": [{
                "Name": "No power",
                "Value": "1"
            }, {
                "Name": "Incomprehensible",
                "Value": "2"
            }, {
                "Name": "Inappropriate",
                "Value": "3"
            }, {
                "Name": "Confused",
                "Value": "4"
            }, {
                "Name": "Oriented",
                "Value": "5"
            }]
        });

        var oEOModel = new sap.ui.model.json.JSONModel({
            "EOCollection": [{
                "Name": "None",
                "Value": "1"
            }, {
                "Name": "To Pain",
                "Value": "2"
            }, {
                "Name": "To Speech",
                "Value": "3"
            }, {
                "Name": "Spontaneous",
                "Value": "4"
            }]
        });

        sap.ui.getCore().byId("API_GCS_MR_LIST").setModel(oMRModel, "MR");
        sap.ui.getCore().byId("API_GCS_VR_LIST").setModel(oVRModel, "VR");
        sap.ui.getCore().byId("API_GCS_EO_LIST").setModel(oEOModel, "EO");

        if (_patient.DocumentNo) {
            var sPath = "GcsDetailHdrSet?$filter= DocumentNumber eq '" + _patient.DocumentNo + "' and DocumentVersion eq '" + _patient.DocumentVersion + "' and DocumentType eq '" + _patient.DocumentType + "' and DocumentPart eq '" + _patient.DocumantPart + "'&$expand=GCSDETAILHDRTOITEM";
            thatGCS.oModel.read(sPath, null, null, false, function(oData, oResponse) {
                    thatGCS.initGCSTotalScore();
                    var selectedData = oData.results[0];
                    thatGCS.setSelectedDataToLists(selectedData);
                    thatGCS.setButtonsEnability();
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
                sap.ui.getCore().byId("API_GCS_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_GCS_SAVE_BUTTON").setVisible(true);
            }
        }
    },

    //In edit and display mode, set selected data to lists
    setSelectedDataToLists: function(selectedData) {
        var score = sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score["BestMotorResponse"].Value = selectedData.BeMotorResp;
        score["BestVerbalResponse"].Value = selectedData.BeVerbalResp;
        score["EyeOpening"].Value = selectedData.EyeOpen;
        score.TotalScore = selectedData.GcsNTotal;
        var motorRespList = sap.ui.getCore().byId("API_GCS_MR_LIST");
        for (var i = 0; i < motorRespList.getModel("MR").getData().MRCollection.length; i++) {
            if (selectedData.BeMotorResp == motorRespList.getModel("MR").getData().MRCollection[i].Value) {
                motorRespList.setSelectedItem(motorRespList.getItems()[i]);
                score["BestMotorResponse"].Name = motorRespList.getModel("MR").getData().MRCollection[i].Name;
                break;
            }
        }

        var verbalRespList = sap.ui.getCore().byId("API_GCS_VR_LIST");
        for (var i = 0; i < verbalRespList.getModel("VR").getData().VRCollection.length; i++) {
            if (selectedData.BeVerbalResp == verbalRespList.getModel("VR").getData().VRCollection[i].Value) {
                verbalRespList.setSelectedItem(verbalRespList.getItems()[i]);
                score["BestVerbalResponse"].Name = verbalRespList.getModel("VR").getData().VRCollection[i].Name;
                break;
            }
        }
        var eyeOpeningList = sap.ui.getCore().byId("API_GCS_EO_LIST");
        for (var i = 0; i < eyeOpeningList.getModel("EO").getData().EOCollection.length; i++) {
            if (selectedData.EyeOpen == eyeOpeningList.getModel("EO").getData().EOCollection[i].Value) {
                eyeOpeningList.setSelectedItem(eyeOpeningList.getItems()[i]);
                score["EyeOpening"].Name = eyeOpeningList.getModel("EO").getData().EOCollection[i].Name;
                break;
            }
        }

        sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").getModel("ScoreModel").refresh(true);
        sap.ui.getCore().byId("API_GLASSGOW_COMA_TOTAL").setVisible(true);
        sap.ui.getCore().byId("API_GLASSGOW_COMA_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getGCSInterpretation(parseInt(score.TotalScore)) + ")");
    },

    // setting enablity of buttons based on mode 
    setButtonsEnability: function() {
        var thatGCS = this;
        if (_patient.Mode == "E") {
            thatGCS.setListEnable();
            if (_patient.Status == "IW") {
                sap.ui.getCore().byId("API_GCS_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_GCS_SAVE_BUTTON").setVisible(true);
            } else {
                sap.ui.getCore().byId("API_GCS_RELEASE_BUTTON").setVisible(false);
                sap.ui.getCore().byId("API_GCS_SAVE_BUTTON").setVisible(false);
            }
        } else {
            thatGCS.setListDisable();
            sap.ui.getCore().byId("API_GCS_RELEASE_BUTTON").setVisible(false);
            sap.ui.getCore().byId("API_GCS_SAVE_BUTTON").setVisible(false);
        }
    },

    // enable lists for edit mode
    setListEnable: function(oEvent) {
        var motorRespList = sap.ui.getCore().byId("API_GCS_MR_LIST").getAggregation("items");
        for (var i = 0; i < motorRespList.length; i++) {
            motorRespList[i].getSingleSelectControl().setEnabled(true);
        }
        var verbalRespList = sap.ui.getCore().byId("API_GCS_VR_LIST").getAggregation("items");
        for (var i = 0; i < verbalRespList.length; i++) {
            verbalRespList[i].getSingleSelectControl().setEnabled(true);
        }
        var eyeOpeningList = sap.ui.getCore().byId("API_GCS_EO_LIST").getAggregation("items");
        for (var i = 0; i < eyeOpeningList.length; i++) {
            eyeOpeningList[i].getSingleSelectControl().setEnabled(true);
        }
    },

    // disable lists for display mode
    setListDisable: function(oEvent) {
        var motorRespList = sap.ui.getCore().byId("API_GCS_MR_LIST").getAggregation("items");
        for (var i = 0; i < motorRespList.length; i++) {
            motorRespList[i].getSingleSelectControl().setEnabled(false);
        }
        var verbalRespList = sap.ui.getCore().byId("API_GCS_VR_LIST").getAggregation("items");
        for (var i = 0; i < verbalRespList.length; i++) {
            verbalRespList[i].getSingleSelectControl().setEnabled(false);
        }
        var eyeOpeningList = sap.ui.getCore().byId("API_GCS_EO_LIST").getAggregation("items");
        for (var i = 0; i < eyeOpeningList.length; i++) {
            eyeOpeningList[i].getSingleSelectControl().setEnabled(false);
        }
    },

    // GCS total score model initialisation
    initGCSTotalScore: function() {
        var scoreModel = new sap.ui.model.json.JSONModel({
            "ScoreModel": [{
                "TotalScore": "",
                "BestMotorResponse": {
                    "Name": "",
                    "Value": ""
                },
                "BestVerbalResponse": {
                    "Name": "",
                    "Value": ""
                },
                "EyeOpening": {
                    "Name": "",
                    "Value": ""
                }
            }]
        });
        sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").setModel(scoreModel, "ScoreModel");
        sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").bindElement("ScoreModel>/ScoreModel/0");
        sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").getModel("ScoreModel").refresh(true);

    },

    // on change of list selection
    onSelectionChange: function(oEvent) {
        var thatGCS = this;
        var object;
        var path = oEvent.getSource().getSelectedContextPaths()[0].split("/");
        var model = path[1];
        switch (model) {
            case "MRCollection":
                object = sap.ui.getCore().byId("API_GCS_MR_LIST").getModel("MR").getData().MRCollection[path[2]];
                thatGCS.modifyGCSTotalScore("BestMotorResponse", object);
                break;
            case "VRCollection":
                object = sap.ui.getCore().byId("API_GCS_VR_LIST").getModel("VR").getData().VRCollection[path[2]];
                thatGCS.modifyGCSTotalScore("BestVerbalResponse", object);
                break;
            case "EOCollection":
                object = sap.ui.getCore().byId("API_GCS_EO_LIST").getModel("EO").getData().EOCollection[path[2]];
                thatGCS.modifyGCSTotalScore("EyeOpening", object);
                break;
        }
    },

    // total score
    modifyGCSTotalScore: function(path, object) {
        var score = sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        score[path].Name = object.Name;
        score[path].Value = object.Value ? object.Value : "";
        if (score.BestMotorResponse.Value && score.BestVerbalResponse.Value && score.EyeOpening.Value) {
            score.TotalScore = (parseInt(score.BestMotorResponse.Value) + parseInt(score.BestVerbalResponse.Value) + parseInt(score.EyeOpening.Value)).toString();
            sap.ui.getCore().byId("API_GLASSGOW_COMA_TOTAL").setVisible(true);
            sap.ui.getCore().byId("API_GLASSGOW_COMA_TOTAL").setText("Total Score :" + score.TotalScore + " (" + ZHN_API_SCORES.utils.Formatter.getGCSInterpretation(parseInt(score.TotalScore)) + ")");
        }

        sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").getModel("ScoreModel").refresh(true);
    },

    // on save pressed
    _handleAPIGCSSavePressed: function() {
        var thatGCS = this;
        var score = sap.ui.getCore().byId("API_GLASSGOW_COMA_DIALOG").getModel("ScoreModel").getData().ScoreModel[0];
        if (score.BestMotorResponse.Value && score.BestVerbalResponse.Value && score.EyeOpening.Value) {

            var data = null;
            var totalScoreAbrValue = null;
            var totalScoreValue = score.TotalScore;
            if (parseInt(totalScoreValue) < 9) {
                totalScoreAbrValue = "S";
            } else if (parseInt(totalScoreValue) >= 9 || parseInt(TotalScoreValue) < 13) {
                totalScoreAbrValue = "M";
            } else if (parseInt(totalScoreValue) >= 13) {
                totalScoreAbrValue = "N";
            }

            data = {
                BeMotorResp: score.BestMotorResponse.Value,
                BeVerbalResp: score.BestVerbalResponse.Value,
                DepartmentOu: _patient.DeptOu,
                DocumentNumber: _patient.DocumentNo,
                DocumentPart: _patient.DocumantPart,
                DocumentType: _patient.DocumentType,
                DocumentVersion: _patient.DocumentVersion,
                EmployeeResp: "",
                EyeOpen: score.EyeOpening.Value,
                GCSDETAILHDRTOITEM: [],
                GcsNInterpretion: totalScoreAbrValue,
                GcsNTotal: totalScoreValue,
                Institution: "RFH1",
                NeuGcsped: "",
                NeuroGlas: "",
                PatientName: _patient.PatientName,
                PatientMrn: _patient.Patient,
                PatientSex: _patient.Sex,
                PatientDob: _patient.Birthdate,
                PatientDoctor: _patient.PatientDoctor,
                PatientAge: _patient.Age,
                PatientCasetype: _patient.CaseType,
                PatientCaseno: _patient.CaseNo,
                PmdPackage: ""
            };
            if (_patient.DocumentNo && _patient.Mode == "E") {
                data.Mode = "U";
            } else {
                data.Mode = "C";
            }

            thatGCS.oModel.create("/GcsDetailHdrSet", data, null, function(oData, oResponse) {
                thatGCS["GlasgowComaCreate"].destroy();
                sap.m.MessageToast.show(oResponse.headers["sap-message"]);
                if (thatGCS.GCSDirectRelease) {
                    var docNumber = oResponse.headers["sap-message"].split(" ")[2];
                    var data = {
                    		 "DocumentNumber": docNumber,
                             "DocumentType": _patient.DocumentType ? _patient.DocumentType : "MED",
                             "DocumentVersion": _patient.DocumentVersion ? _patient.DocumentVersion : "00",
                             "DocumentPart": _patient.DocumantPart ? _patient.DocumantPart : "000"
                    };
                    thatGCS.oModel.update("PmdReleaseSet('" + docNumber + "')", data, null, function(oData, oResponse) {
                            thatGCS.GCSDirectRelease = false;
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
                            eb.publish("ZHN_API_SCORES", "GCSRelease", returnData);
                        
                        },
                        function(oData, oResponse) {
                            thatGCS.GCSDirectRelease = false;
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
            }, function(oData, response) {
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
    _handleAPIGCSReleasePressed: function() {
        var thatGCS = this;
        thatGCS.GCSDirectRelease = true;
        thatGCS._handleAPIGCSSavePressed();
        thatGCS.GCSDirectRelease = false;
    }
});
jQuery.sap.declare("ZHN_API_SCORES.vip.VIP");
jQuery.sap.require("sap.ui.core.Component");
jQuery.sap.require("ZHN_API_SCORES.utils.Formatter");
sap.ui.core.Component.extend("ZHN_API_SCORES.vip.VIP", {

    initVIP: function(that, patient) {
        _thatVIP = that;
        _patient = patient;
        /*{  Institution: "RFH1",
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

        var _proxy = "" ;
        //var _proxy = "proxy/http/devnwngd.ril.com:8000";
        // Initialize service model
        var serviceUrl = _proxy + "/sap/opu/odata/sap/Z_FIORI_SCORES_PMD_SRV";
        this.oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);

        this.openDialog("VIPCreate");
        this.initVIPCreateDiag();
    },

    // open dialog
    openDialog: function(sName) {
        if (!this[sName]) {
            this[sName] = sap.ui.xmlfragment("ZHN_API_SCORES/vip/" + sName, this);
            _thatVIP.getView().addDependent(this[sName]);
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

    // create vip dialog
    initVIPCreateDiag: function() {
        var thatVIP = this;
        var oVIPModel = new sap.ui.model.json.JSONModel({
            "VIPData": [{
                "Information": "IV site appears healty",
                "Interpretation": "No sign of Phlebitis",
                "Intervention": "Observe cannula",
                "Value": "0"
            }, {
                "Information": "One of the following is evident:\n a.Slight pain near IV site\n b.Slight REDNESS near IV site",
                "Interpretation": "Possible first signs",
                "Intervention": "Observe cannula",
                "Value": "1"
            }, {
                "Information": "Two of the following are evident:\n a.Pain at IV site\n b.Erythema \n c.Swelling",
                "Interpretation": "Early stages of Phlebitis ",
                "Intervention": "Resite cannula",
                "Value": "2"
            }, {
                "Information": "All of the following are evident:\n a.Pain along path of canulla\n b.Erythema \n c.Induratio",
                "Interpretation": "Mid-stage of Phlebitis ",
                "Intervention": "Resite cannula consider treatment",
                "Value": "3"
            }, {
                "Information": "All of the following are evident and extensive:\n a.Pain along path of canulla\n b.Erythema \n c.Induratio \n d.Palpabic venous cord",
                "Interpretation": "Advanced stage of Phlebitis or start of thrombophlebitis",
                "Intervention": "Resite cannula consider treatment",
                "Value": "4"
            }, {
                "Information": "All of the following are evident and extensive:\n a.Pain along path of canulla\n b.Erythema \n c.Induratio \n d.Palpabic venous cord\n e. Pyrexia",
                "Interpretation": "Advanced stage of thrombophlebitis",
                "Intervention": "Initiate treatment",
                "Value": "5"
            }]
        });

        sap.ui.getCore().byId("API_VIP_TABLE").setModel(oVIPModel, "VIP");

        if (_patient.DocumentNo) {
            var sPath = "ScVipDetailHdrSet?$filter= DocumentNumber eq '" + _patient.DocumentNo + "' and DocumentVersion eq '" + _patient.DocumentVersion + "' and DocumentType eq '" + _patient.DocumentType + "' and DocumentPart eq '" + _patient.DocumantPart + "'&$expand=SCVIPDETAILHDRTOITEM";
            thatVIP.oModel.read(sPath, null, null, false, function(oData, oResponse) {
                    var selectedData = oData.results[0];
                    thatVIP.setSelectedDataToLists(selectedData);
                    thatVIP.setButtonsEnability();
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
                sap.ui.getCore().byId("API_VIP_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_VIP_SAVE_BUTTON").setVisible(true);
            }
        }
    },

    //In edit and display mode, set selected data to lists
    setSelectedDataToLists: function(selectedData) {
        sap.ui.getCore().byId("API_VIP_TABLE").setHeaderText("Visual Infusion Phlebitis " + "(" + selectedData.ScvipRb + ")");
        var vipList = sap.ui.getCore().byId("API_VIP_TABLE");
        for (var i = 0; i < vipList.getModel("VIP").getData().VIPData.length; i++) {
            if (selectedData.ScvipRb == vipList.getModel("VIP").getData().VIPData[i].Value) {
                vipList.setSelectedItem(vipList.getItems()[i]);
                break;
            }
        }
        sap.ui.getCore().byId("API_VIP_TABLE").getModel("VIP").refresh(true);
    },

    // setting enability of buttons based on mode 
    setButtonsEnability: function() {
        var thatVIP = this;
        if (_patient.Mode == "E") {
            thatVIP.setListEnable();
            if (_patient.Status == "IW") {
                sap.ui.getCore().byId("API_VIP_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_VIP_SAVE_BUTTON").setVisible(true);
            } else {
                sap.ui.getCore().byId("API_VIP_RELEASE_BUTTON").setVisible(false);
                sap.ui.getCore().byId("API_VIP_SAVE_BUTTON").setVisible(false);
            }
        } else {
            thatVIP.setListDisable();
            sap.ui.getCore().byId("API_VIP_RELEASE_BUTTON").setVisible(false);
            sap.ui.getCore().byId("API_VIP_SAVE_BUTTON").setVisible(false);
        }
    },

    // enable lists for edit mode
    setListEnable: function(oEvent) {
        var vipList = sap.ui.getCore().byId("API_VIP_TABLE").getAggregation("items");
        for (var i = 0; i < vipList.length; i++) {
            vipList[i].getSingleSelectControl().setEnabled(true);
        }
    },

    // disable lists for display mode
    setListDisable: function(oEvent) {
        var vipList = sap.ui.getCore().byId("API_VIP_TABLE").getAggregation("items");
        for (var i = 0; i < vipList.length; i++) {
            vipList[i].getSingleSelectControl().setEnabled(false);
        }

    },

    // on select of item 
    onSelectionChange: function(oEvent) {
        sap.ui.getCore().byId("API_VIP_TABLE").setHeaderText("Visual Infusion Phlebitis" + "(" + oEvent.getSource().getSelectedContextPaths()[0].split("/")[2] + ")");
    },

    // on save pressed
    _handleAPIVIPSavePressed: function() {
        var thatVIP = this;
        if (sap.ui.getCore().byId("API_VIP_TABLE").getSelectedItem()) {
            var vipScore = sap.ui.getCore().byId("API_VIP_TABLE").getModel("VIP").getData().VIPData[sap.ui.getCore().byId("API_VIP_TABLE").getSelectedItem().getBindingContextPath().split("/")[2]];

            data = {
                DocumentType: _patient.DocumentType,
                DocumentNumber: _patient.DocumentNo,
                DocumentVersion: _patient.DocumentVersion,
                DocumentPart: _patient.DocumantPart,
                PatientName: _patient.PatientName,
                PatientMrn: _patient.Patient,
                PatientSex: _patient.Sex,
                PatientDob: _patient.Birthdate,
                PatientDoctor: _patient.PatientDoctor,
                PatientAge: _patient.Age,
                PatientCasetype: _patient.CaseType,
                PatientCaseno: _patient.CaseNo,
                ScvipRb: vipScore.Value,
                ScvipTotal: vipScore.Value,
                Description: vipScore.Information,
                Interpretion: vipScore.Interpretation,
                Intervention: vipScore.Intervention,
                PmdPackag: "",
                Institution: "RFH1",
                DepartmentOu: _patient.DeptOu,
                EmployeeResp: "",
                SCVIPDETAILHDRTOITEM: []
            };
            if (_patient.DocumentNo && _patient.Mode == "E") {
                data.Mode = "U";
            } else {
                data.Mode = "C";
            }

            thatVIP.oModel.create("/ScVipDetailHdrSet", data, null, function(oData, oResponse) {
                //execute in case of call success
                thatVIP["VIPCreate"].destroy();
                sap.m.MessageToast.show(oResponse.headers["sap-message"]);
                if (thatVIP.VIPDirectRelease) {
                    var docNumber = oResponse.headers["sap-message"].split(" ")[2];
                    var data = {
                    		 "DocumentNumber": docNumber,
                             "DocumentType": _patient.DocumentType ? _patient.DocumentType : "MED",
                             "DocumentVersion": _patient.DocumentVersion ? _patient.DocumentVersion : "00",
                             "DocumentPart": _patient.DocumantPart ? _patient.DocumantPart : "000"
                    };
                    thatVIP.oModel.update("PmdReleaseSet('" + docNumber + "')", data, null, function(oData, oResponse) {

                            thatVIP.VIPDirectRelease = false;
                            sap.m.MessageToast.show(oResponse.headers["sap-message"]);
                            
                            var eb = sap.ui.getCore().getEventBus();
                            var returnData = {
                                    "DocumentNumber": docNumber,
                                    "DocumentType": _patient.DocumentType,
                                    "DocumentVersion": _patient.DocumentVersion,
                                    "DocumentPart": _patient.DocumantPart,
                                    "TotalScore": vipScore.Value
                                };
                            eb.publish("ZHN_API_SCORES", "VIPRelease", returnData);
                        
                        },
                        function(oData, oResponse) {
                            thatVIP.VIPDirectRelease = false;
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
            sap.m.MessageToast.show("Please select Visual Infusion Phlebitis .");
        }
    },

    // on release pressed
    _handleAPIVIPReleasePressed: function() {
        var thatVIP = this;
        thatVIP.VIPDirectRelease = true;
        thatVIP._handleAPIVIPSavePressed();
        thatVIP.VIPDirectRelease = false;
    }
});
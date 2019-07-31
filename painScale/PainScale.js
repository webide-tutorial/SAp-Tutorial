jQuery.sap.declare("ZHN_API_SCORES.painScale.PainScale");
jQuery.sap.require("sap.ui.core.Component");
jQuery.sap.require("ZHN_API_SCORES.utils.Formatter");
sap.ui.core.Component.extend("ZHN_API_SCORES.painScale.PainScale", {

    initPainScale: function(that, patient) {
        _thatPS = that;
        _patient = patient;
        /*{      	Institution: "RFH1",
    	 			PatientId : thatPS.patientDetail.Patient,
    	 			CaseNo: thatPS.patientDetail.Case,	
    	 			PatientName: thatPS.patientDetail.PatientName,
    	 			Sex : thatPS.patientDetail.Sex,
    	 			Birthdate : thatPS.patientDetail.Birthdate,
    	 			PatientDoctor : thatPS.patientDetail.PatientDoctor,
    	 			Age : thatPS.patientDetail.Age,
    	 			CaseType : thatPS.patientDetail.CaseType,
			       	DeptOu : thatPS.patientDetail.DeptOu,
			       	Status :"",
			       	DocumentNo : "",
			       	DocumentType :"",
			        DocumentVersion : "",
			        DocumantPart : "",
			        Mode : "E"
	    }*/

        var _proxy = "";
 	   //var _proxy = "proxy/http/devnwngd.ril.com:8000";
 	   // Initialize service model
        var serviceUrl = _proxy+"/sap/opu/odata/sap/Z_FIORI_SCORES_PMD_SRV";
        this.oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);

        this.openDialog("PainScaleCreate");
        sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").setSelectedKey("1");
        this.onScaleTypeChange();
        this.initPainScaleCreateDiag();
    },

    //open dialog
    openDialog: function(sName) {
        if (!this[sName]) {
            this[sName] = sap.ui.xmlfragment("ZHN_API_SCORES/painScale/" + sName, this);
            _thatPS.getView().addDependent(this[sName]);
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

    // initialise pain scale dialog
    initPainScaleCreateDiag: function() {
        var thatPS = this;
        thatPS.initFaceScaleTotalScore();
        thatPS.initBPScaleTotalScore();
        thatPS.initFlaccScaleTotalScore();
        thatPS.initNipScaleTotalScore();

        if (_patient.DocumentNo) {
            sPath = "ScPainDetailHdrSet?$filter= DocumentNumber eq '" + _patient.DocumentNo + "' and DocumentVersion eq '" + _patient.DocumentVersion + "' and DocumentType eq '" + _patient.DocumentType + "' and DocumentPart eq '" + _patient.DocumantPart + "'&$expand=SCPAINDETAILHDRTOITEM";
            thatPS.oModel.read(sPath, null, null, false, function(oData, oResponse) {
                    thatPS.initFaceScaleTotalScore();
                    thatPS.initBPScaleTotalScore();
                    thatPS.initFlaccScaleTotalScore();
                    thatPS.initNipScaleTotalScore();
                    var selectedData = oData.results[0];
                    thatPS.setSelectedDataToLists(selectedData);
                    thatPS.setButtonsEnability();
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
                sap.ui.getCore().byId("API_PAINSCALE_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_PAINSCALE_SAVE_BUTTON").setVisible(true);
            }
        }
    },

    // setting enablity of buttons based on mode 
    setButtonsEnability: function() {
        var thatPS = this;
        if (_patient.Mode == "E") {
            thatPS.setListEnable();
            sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").setEnabled(true);
            if (_patient.Status == "IW") {
                sap.ui.getCore().byId("API_PAINSCALE_RELEASE_BUTTON").setVisible(true);
                sap.ui.getCore().byId("API_PAINSCALE_SAVE_BUTTON").setVisible(true);
            } else {
                sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").setEnabled(false);
                sap.ui.getCore().byId("API_PAINSCALE_RELEASE_BUTTON").setVisible(false);
                sap.ui.getCore().byId("API_PAINSCALE_SAVE_BUTTON").setVisible(false);
            }
        } else {
            sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").setEnabled(false);
            thatPS.setListDisable();
            sap.ui.getCore().byId("API_PAINSCALE_RELEASE_BUTTON").setVisible(false);
            sap.ui.getCore().byId("API_PAINSCALE_SAVE_BUTTON").setVisible(false);
        }
    },

    // enable lists for edit mode
    setListEnable: function(oEvent) {
        var faceScaleList = sap.ui.getCore().byId("API_PAIN_SCALE_FC_TABLE").getAggregation("items");
        for (var i = 0; i < faceScaleList.length; i++) {
            faceScaleList[i].getSingleSelectControl().setEnabled(true);
        }
        var bmrList = sap.ui.getCore().byId("API_PAIN_SCALE_BMR_TABLE").getAggregation("items");
        for (var i = 0; i < bmrList.length; i++) {
            bmrList[i].getSingleSelectControl().setEnabled(true);
        }
        var bvrList = sap.ui.getCore().byId("API_PAIN_SCALE_BVR_TABLE").getAggregation("items");
        for (var i = 0; i < bvrList.length; i++) {
            bvrList[i].getSingleSelectControl().setEnabled(true);
        }
        var eyeOpeningList = sap.ui.getCore().byId("API_PAIN_SCALE_EO_TABLE").getAggregation("items");
        for (var i = 0; i < eyeOpeningList.length; i++) {
            eyeOpeningList[i].getSingleSelectControl().setEnabled(true);
        }
        var flaccFaceList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_FACE_TABLE").getAggregation("items");
        for (var i = 0; i < flaccFaceList.length; i++) {
            flaccFaceList[i].getSingleSelectControl().setEnabled(true);
        }
        var flaccLegsList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_LEGS_TABLE").getAggregation("items");
        for (var i = 0; i < flaccLegsList.length; i++) {
            flaccLegsList[i].getSingleSelectControl().setEnabled(true);
        }
        var flaccActivityList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_ACTIVITY_TABLE").getAggregation("items");
        for (var i = 0; i < flaccActivityList.length; i++) {
            flaccActivityList[i].getSingleSelectControl().setEnabled(true);
        }
        var flaccCryList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CRY_TABLE").getAggregation("items");
        for (var i = 0; i < flaccCryList.length; i++) {
            flaccCryList[i].getSingleSelectControl().setEnabled(true);
        }
        var flaccConsolabilityList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CONSOLABILITY_TABLE").getAggregation("items");
        for (var i = 0; i < flaccConsolabilityList.length; i++) {
            flaccConsolabilityList[i].getSingleSelectControl().setEnabled(true);
        }
        var nipFaceExpList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_FACIAL_EXPRESSION_TABLE").getAggregation("items");
        for (var i = 0; i < nipFaceExpList.length; i++) {
            nipFaceExpList[i].getSingleSelectControl().setEnabled(true);
        }
        var nipBreathPatList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_BREATHING_PATTERN_TABLE").getAggregation("items");
        for (var i = 0; i < nipBreathPatList.length; i++) {
            nipBreathPatList[i].getSingleSelectControl().setEnabled(true);
        }
        var nipArmsList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_ARMS_TABLE").getAggregation("items");
        for (var i = 0; i < nipArmsList.length; i++) {
            nipArmsList[i].getSingleSelectControl().setEnabled(true);
        }
        var nipLegsList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_LEGS_TABLE").getAggregation("items");
        for (var i = 0; i < nipLegsList.length; i++) {
            nipLegsList[i].getSingleSelectControl().setEnabled(true);
        }
        var nipArousalList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_STATE_OF_AROUSAL_TABLE").getAggregation("items");
        for (var i = 0; i < nipArousalList.length; i++) {
            nipArousalList[i].getSingleSelectControl().setEnabled(true);
        }
        var nipCryList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_CRY_TABLE").getAggregation("items");
        for (var i = 0; i < nipCryList.length; i++) {
            nipCryList[i].getSingleSelectControl().setEnabled(true);
        }
    },

    // disable lists for display mode
    setListDisable: function(oEvent) {
        var faceScaleList = sap.ui.getCore().byId("API_PAIN_SCALE_FC_TABLE").getAggregation("items");
        for (var i = 0; i < faceScaleList.length; i++) {
            faceScaleList[i].getSingleSelectControl().setEnabled(false);
        }
        var bmrList = sap.ui.getCore().byId("API_PAIN_SCALE_BMR_TABLE").getAggregation("items");
        for (var i = 0; i < bmrList.length; i++) {
            bmrList[i].getSingleSelectControl().setEnabled(false);
        }
        var bvrList = sap.ui.getCore().byId("API_PAIN_SCALE_BVR_TABLE").getAggregation("items");
        for (var i = 0; i < bvrList.length; i++) {
            bvrList[i].getSingleSelectControl().setEnabled(false);
        }
        var eyeOpeningList = sap.ui.getCore().byId("API_PAIN_SCALE_EO_TABLE").getAggregation("items");
        for (var i = 0; i < eyeOpeningList.length; i++) {
            eyeOpeningList[i].getSingleSelectControl().setEnabled(false);
        }
        var flaccFaceList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_FACE_TABLE").getAggregation("items");
        for (var i = 0; i < flaccFaceList.length; i++) {
            flaccFaceList[i].getSingleSelectControl().setEnabled(false);
        }
        var flaccLegsList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_LEGS_TABLE").getAggregation("items");
        for (var i = 0; i < flaccLegsList.length; i++) {
            flaccLegsList[i].getSingleSelectControl().setEnabled(false);
        }
        var flaccActivityList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_ACTIVITY_TABLE").getAggregation("items");
        for (var i = 0; i < flaccActivityList.length; i++) {
            flaccActivityList[i].getSingleSelectControl().setEnabled(false);
        }
        var flaccCryList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CRY_TABLE").getAggregation("items");
        for (var i = 0; i < flaccCryList.length; i++) {
            flaccCryList[i].getSingleSelectControl().setEnabled(false);
        }
        var flaccConsolabilityList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CONSOLABILITY_TABLE").getAggregation("items");
        for (var i = 0; i < flaccConsolabilityList.length; i++) {
            flaccConsolabilityList[i].getSingleSelectControl().setEnabled(false);
        }
        var nipFaceExpList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_FACIAL_EXPRESSION_TABLE").getAggregation("items");
        for (var i = 0; i < nipFaceExpList.length; i++) {
            nipFaceExpList[i].getSingleSelectControl().setEnabled(false);
        }
        var nipBreathPatList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_BREATHING_PATTERN_TABLE").getAggregation("items");
        for (var i = 0; i < nipBreathPatList.length; i++) {
            nipBreathPatList[i].getSingleSelectControl().setEnabled(false);
        }
        var nipArmsList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_ARMS_TABLE").getAggregation("items");
        for (var i = 0; i < nipArmsList.length; i++) {
            nipArmsList[i].getSingleSelectControl().setEnabled(false);
        }
        var nipLegsList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_LEGS_TABLE").getAggregation("items");
        for (var i = 0; i < nipLegsList.length; i++) {
            nipLegsList[i].getSingleSelectControl().setEnabled(false);
        }
        var nipArousalList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_STATE_OF_AROUSAL_TABLE").getAggregation("items");
        for (var i = 0; i < nipArousalList.length; i++) {
            nipArousalList[i].getSingleSelectControl().setEnabled(false);
        }
        var nipCryList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_CRY_TABLE").getAggregation("items");
        for (var i = 0; i < nipCryList.length; i++) {
            nipCryList[i].getSingleSelectControl().setEnabled(false);
        }

    },

    //In edit and display mode, set selected data to lists
    setSelectedDataToLists: function(selectedData) {
        var thatPS = this;
        var bpsScore = sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").getData().ScoreModelBPS[0];

        var faceScore = sap.ui.getCore().byId("API_FACE_SCALE_PANEL").getModel("FaceScaleModel").getData().FaceScaleScore[0];
        faceScore.Name = selectedData.FaceInterpretion;
        faceScore.Value = selectedData.FaceScale;
        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").getModel("FaceScaleModel").refresh(true);
        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").setHeaderText("Face Scale (" + faceScore.Value + ")");

        bpsScore["FaceScale"].Value = selectedData.FaceScale;
        bpsScore["BestMotorResponse"].Value = selectedData.FaceExpresion;
        bpsScore["BestVerbalResponse"].Value = selectedData.BpainUpLiMov;
        bpsScore["EyeOpening"].Value = selectedData.BpainCompl;
        if (parseInt(selectedData.FaceExpresion))
            bpsScore.TotalScore = parseInt(selectedData.FaceExpresion).toString();
        if (parseInt(selectedData.BpainUpLiMov))
            bpsScore.TotalScore = (parseInt(bpsScore.TotalScore) + parseInt(selectedData.BpainUpLiMov)).toString();
        if (parseInt(selectedData.BpainCompl))
            bpsScore.TotalScore = (parseInt(bpsScore.TotalScore) + parseInt(selectedData.BpainCompl)).toString();


        var faceList = sap.ui.getCore().byId("API_PAIN_SCALE_FC_TABLE");
        for (var i = 0; i < faceList.getModel("FS").getData().FaceScale.length; i++) {
            if (selectedData.FaceScale == faceList.getModel("FS").getData().FaceScale[i].Value) {
                faceList.setSelectedItem(faceList.getItems()[i]);
                bpsScore["FaceScale"].Name = faceList.getModel("FS").getData().FaceScale[i].Name;
                break;
            }
        }
        var bmrList = sap.ui.getCore().byId("API_PAIN_SCALE_BMR_TABLE");
        for (var i = 0; i < bmrList.getModel("MR").getData().MRCollection.length; i++) {
            if (selectedData.FaceExpresion == bmrList.getModel("MR").getData().MRCollection[i].Value) {
                bmrList.setSelectedItem(bmrList.getItems()[i]);
                bpsScore["BestMotorResponse"].Name = bmrList.getModel("MR").getData().MRCollection[i].Name;
                break;
            }
        }

        var bvrList = sap.ui.getCore().byId("API_PAIN_SCALE_BVR_TABLE");
        for (var i = 0; i < bvrList.getModel("VR").getData().VRCollection.length; i++) {
            if (selectedData.BpainUpLiMov == bvrList.getModel("VR").getData().VRCollection[i].Value) {
                bvrList.setSelectedItem(bvrList.getItems()[i]);
                bpsScore["BestVerbalResponse"].Name = bvrList.getModel("VR").getData().VRCollection[i].Name;
                break;
            }
        }
        var eyeOpeningList = sap.ui.getCore().byId("API_PAIN_SCALE_EO_TABLE");
        for (var i = 0; i < eyeOpeningList.getModel("EO").getData().EOCollection.length; i++) {
            if (selectedData.BpainCompl == eyeOpeningList.getModel("EO").getData().EOCollection[i].Value) {
                eyeOpeningList.setSelectedItem(eyeOpeningList.getItems()[i]);
                bpsScore["EyeOpening"].Name = eyeOpeningList.getModel("EO").getData().EOCollection[i].Name;
                break;
            }
        }
        sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").refresh(true);
        sap.ui.getCore().byId("API_BPS_PANEL").setHeaderText("Behavioral Pain Scale (" + bpsScore.TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getBPSInterpretation(parseInt(bpsScore.TotalScore)) + ")");

        var flaccScore = sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").getData().FLACCScaleScoreModel[0];
        flaccScore["Face"].Value = selectedData.Face;
        flaccScore["Legs"].Value = selectedData.Legs;
        flaccScore["Activity"].Value = selectedData.Activity;
        flaccScore["Cry"].Value = selectedData.Cry;
        flaccScore["Consolability"].Value = selectedData.Consolability;

        if (flaccScore.Face.Value && flaccScore.Legs.Value && flaccScore.Activity.Value && flaccScore.Cry.Value && flaccScore.Consolability.Value)
        flaccScore.TotalScore = (parseInt(selectedData.Face) + parseInt(selectedData.Legs) + parseInt(selectedData.Activity) + parseInt(selectedData.Cry) + parseInt(selectedData.Consolability)).toString();

        var flaccFaceList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_FACE_TABLE");
        for (var i = 0; i < flaccFaceList.getModel("FLACCFACE").getData().FLACCFaceCollection.length; i++) {
            if (selectedData.Face == flaccFaceList.getModel("FLACCFACE").getData().FLACCFaceCollection[i].Value) {
                flaccFaceList.setSelectedItem(flaccFaceList.getItems()[i]);
                flaccScore["Face"].Name = flaccFaceList.getModel("FLACCFACE").getData().FLACCFaceCollection[i].Name;
                break;
            }
        }
        var flaccLegList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_LEGS_TABLE");
        for (var i = 0; i < flaccLegList.getModel("FLACCLEGS").getData().FLACCLegsCollection.length; i++) {
            if (selectedData.Legs == flaccLegList.getModel("FLACCLEGS").getData().FLACCLegsCollection[i].Value) {
                flaccLegList.setSelectedItem(flaccLegList.getItems()[i]);
                flaccScore["Legs"].Name = flaccLegList.getModel("FLACCLEGS").getData().FLACCLegsCollection[i].Name;
                break;
            }
        }
        var flaccActivityList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_ACTIVITY_TABLE");
        for (var i = 0; i < flaccActivityList.getModel("FLACCACTIVITY").getData().FLACCActivityCollection.length; i++) {
            if (selectedData.Activity == flaccActivityList.getModel("FLACCACTIVITY").getData().FLACCActivityCollection[i].Value) {
                flaccActivityList.setSelectedItem(flaccActivityList.getItems()[i]);
                flaccScore["Activity"].Name = flaccActivityList.getModel("FLACCACTIVITY").getData().FLACCActivityCollection[i].Name;
                break;
            }
        }
        var flaccCryList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CRY_TABLE");
        for (var i = 0; i < flaccCryList.getModel("FLACCCRY").getData().FLACCCryCollection.length; i++) {
            if (selectedData.Cry == flaccCryList.getModel("FLACCCRY").getData().FLACCCryCollection[i].Value) {
                flaccCryList.setSelectedItem(flaccCryList.getItems()[i]);
                flaccScore["Cry"].Name = flaccCryList.getModel("FLACCCRY").getData().FLACCCryCollection[i].Name;
                break;
            }
        }
        var flaccConsolabilitList = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CONSOLABILITY_TABLE");
        for (var i = 0; i < flaccConsolabilitList.getModel("FLACCCONSOLABILITY").getData().FLACCConsolabilityCollection.length; i++) {
            if (selectedData.Consolability == flaccConsolabilitList.getModel("FLACCCONSOLABILITY").getData().FLACCConsolabilityCollection[i].Value) {
                flaccConsolabilitList.setSelectedItem(flaccConsolabilitList.getItems()[i]);
                flaccScore["Consolability"].Name = flaccConsolabilitList.getModel("FLACCCONSOLABILITY").getData().FLACCConsolabilityCollection[i].Name;
                break;
            }
        }
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").refresh(true);
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").setHeaderText("FLACC Scale (" + flaccScore.TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getFLACCInterpretation(parseInt(flaccScore.TotalScore)) + ")");

        var nipScaleScore = sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").getData().NIPScaleScoreModel[0];
        nipScaleScore["FacialExpression"].Value = selectedData.NeoFacial;
        nipScaleScore["BreathingPattern"].Value = selectedData.NeoBreath;
        nipScaleScore["Arms"].Value = selectedData.NeoArms;
        nipScaleScore["Legs"].Value = selectedData.NeoLegs;
        nipScaleScore["StateofArousal"].Value = selectedData.NeoState;
        nipScaleScore["Cry"].Value = selectedData.NeoCry;
        nipScaleScore["TotalScore"] = selectedData.NeoTotalScore;

        var nipFacialExpList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_FACIAL_EXPRESSION_TABLE");
        for (var i = 0; i < nipFacialExpList.getModel("NIPFACIALEXPRS").getData().NIPFacialexpressionCollection.length; i++) {
            if (selectedData.NeoFacial == nipFacialExpList.getModel("NIPFACIALEXPRS").getData().NIPFacialexpressionCollection[i].Value) {
                nipFacialExpList.setSelectedItem(nipFacialExpList.getItems()[i]);
                nipScaleScore["FacialExpression"].Name = nipFacialExpList.getModel("NIPFACIALEXPRS").getData().NIPFacialexpressionCollection[i].Name;
                break;
            }
        }
        var nipBreathPatList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_BREATHING_PATTERN_TABLE");
        for (var i = 0; i < nipBreathPatList.getModel("NIPBRTHNGPATRN").getData().NIPBreathingPatternCollection.length; i++) {
            if (selectedData.NeoBreath == nipBreathPatList.getModel("NIPBRTHNGPATRN").getData().NIPBreathingPatternCollection[i].Value) {
                nipBreathPatList.setSelectedItem(nipBreathPatList.getItems()[i]);
                nipScaleScore["BreathingPattern"].Name = nipBreathPatList.getModel("NIPBRTHNGPATRN").getData().NIPBreathingPatternCollection[i].Name;
                break;
            }
        }
        var nipArmsList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_ARMS_TABLE");
        for (var i = 0; i < nipArmsList.getModel("NIPARMS").getData().NIPArmsCollection.length; i++) {
            if (selectedData.NeoArms == nipArmsList.getModel("NIPARMS").getData().NIPArmsCollection[i].Value) {
                nipArmsList.setSelectedItem(nipArmsList.getItems()[i]);
                nipScaleScore["Arms"].Name = nipArmsList.getModel("NIPARMS").getData().NIPArmsCollection[i].Name;
                break;
            }
        }
        var nipLegsList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_LEGS_TABLE");
        for (var i = 0; i < nipLegsList.getModel("NIPLEGS").getData().NIPLegsCollection.length; i++) {
            if (selectedData.NeoLegs == nipLegsList.getModel("NIPLEGS").getData().NIPLegsCollection[i].Value) {
                nipLegsList.setSelectedItem(nipLegsList.getItems()[i]);
                nipScaleScore["Legs"].Name = nipLegsList.getModel("NIPLEGS").getData().NIPLegsCollection[i].Name;
                break;
            }
        }
        var nipArousalList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_STATE_OF_AROUSAL_TABLE");
        for (var i = 0; i < nipArousalList.getModel("NIPSATEOFARSL").getData().NIPStateofArousalCollection.length; i++) {
            if (selectedData.NeoState == nipArousalList.getModel("NIPSATEOFARSL").getData().NIPStateofArousalCollection[i].Value) {
                nipArousalList.setSelectedItem(nipArousalList.getItems()[i]);
                nipScaleScore["StateofArousal"].Name = nipArousalList.getModel("NIPSATEOFARSL").getData().NIPStateofArousalCollection[i].Name;
                break;
            }
        }
        var nipCryList = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_CRY_TABLE");
        for (var i = 0; i < nipCryList.getModel("NIPCRY").getData().NIPCryCollection.length; i++) {
            if (selectedData.NeoCry == nipCryList.getModel("NIPCRY").getData().NIPCryCollection[i].Value) {
                nipCryList.setSelectedItem(nipCryList.getItems()[i]);
                nipScaleScore["Cry"].Name = nipCryList.getModel("NIPCRY").getData().NIPCryCollection[i].Name;
                break;
            }
        }
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").refresh(true);
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").setHeaderText("Neonatal infant pain scale (" + nipScaleScore.TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getNIPInterpretation(parseInt(nipScaleScore.TotalScore)) + ")");

        sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").setSelectedKey(selectedData.SclType);
        thatPS.onScaleTypeChange();
    },

    onScaleTypeChange: function() {
        var thatPS = this;
        if (!_patient.DocumentNo || !_patient.Mode == "E") {
            thatPS.initFaceScaleTotalScore();
            thatPS.initBPScaleTotalScore();
            thatPS.initFlaccScaleTotalScore();
            thatPS.initNipScaleTotalScore();
        }

        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").setVisible(false);
        sap.ui.getCore().byId("API_BPS_PANEL").setVisible(false);
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").setVisible(false);
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").setVisible(false);
        var key = sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").getSelectedKey();
        if (key) {
            if (key == "1")
                sap.ui.getCore().byId("API_FACE_SCALE_PANEL").setVisible(true);
            if (key == "2")
                sap.ui.getCore().byId("API_BPS_PANEL").setVisible(true);
            if (key == "3")
                sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").setVisible(true);
            if (key == "4")
                sap.ui.getCore().byId("API_NIP_SCALE_PANEL").setVisible(true);
            sap.ui.getCore().byId("API_PAIN_SCALE_DIALOG").getAggregation("_toolbar").setVisible(true);

        } else {
            sap.ui.getCore().byId("API_PAIN_SCALE_DIALOG").getAggregation("_toolbar").setVisible(false);
        }
    },

    // face scale total score
    initFaceScaleTotalScore: function() {
        var oFaceScaleModel = new sap.ui.model.json.JSONModel({
            "FaceScaleScore": [{
                "Name": "",
                "Value": ""
            }]
        });
        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").setModel(oFaceScaleModel, "FaceScaleModel");
        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").bindElement("FaceScaleModel>/FaceScaleScore/0");
        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").getModel("FaceScaleModel").refresh(true);
        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").setHeaderText("Face Scale (" + sap.ui.getCore().byId("API_FACE_SCALE_PANEL").getModel("FaceScaleModel").getData().FaceScaleScore[0].Value + ")");

        var oFSModel = new sap.ui.model.json.JSONModel({
            "FaceScale": [{
                "image": "/sap/bc/ui5_ui5/sap/ZHN_API_SCORES/images/PainScale/0.PNG",
                "Name": "No hurt",
                "Value": "0"
            }, {
                "image": "/sap/bc/ui5_ui5/sap/ZHN_API_SCORES/images/PainScale/1.PNG",
                "Name": "Hurts a little bit",
                "Value": "2"
            }, {
                "image": "/sap/bc/ui5_ui5/sap/ZHN_API_SCORES/images/PainScale/2.PNG",
                "Name": "Hurts little more",
                "Value": "4"
            }, {
                "image": "/sap/bc/ui5_ui5/sap/ZHN_API_SCORES/images/PainScale/3.PNG",
                "Name": "Hurts even more",
                "Value": "6"
            }, {
                "image": "/sap/bc/ui5_ui5/sap/ZHN_API_SCORES/images/PainScale/4.PNG",
                "Name": "Hurts a whole lot",
                "Value": "8"
            }, {
                "image": "/sap/bc/ui5_ui5/sap/ZHN_API_SCORES/images/PainScale/5.PNG",
                "Name": "Hurts worst",
                "Value": "10"
            }]
        });

        sap.ui.getCore().byId("API_PAIN_SCALE_FC_TABLE").setModel(oFSModel, "FS");
    },

    // face scale selection change
    onFaceScaleScoreSelectionChange: function(oEvent) {
        var index = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
        var object = sap.ui.getCore().byId("API_PAIN_SCALE_FC_TABLE").getModel("FS").getData().FaceScale[index];
        var faceScaleScore = sap.ui.getCore().byId("API_FACE_SCALE_PANEL").getModel("FaceScaleModel").getData().FaceScaleScore[0];
        faceScaleScore.Name = object.Name;
        faceScaleScore.Value = object.Value ? object.Value : "";
        if (faceScaleScore.Value)
            sap.ui.getCore().byId("API_FACE_SCALE_PANEL").getModel("FaceScaleModel").refresh(true);
        sap.ui.getCore().byId("API_FACE_SCALE_PANEL").setHeaderText("Face Scale (" + faceScaleScore.Value + ")");
    },

    // BP scale score values
    initBPScaleTotalScore: function() {
        var oMRModel = new sap.ui.model.json.JSONModel({
            "MRCollection": [{
                "Name": "Relaxed",
                "Value": "1"
            }, {
                "Name": "Partially tightened",
                "Value": "2"
            }, {
                "Name": "Fully tightened",
                "Value": "3"
            }, {
                "Name": "Grimacing",
                "Value": "4"
            }]
        });

        var oVRModel = new sap.ui.model.json.JSONModel({
            "VRCollection": [{
                "Name": "No movement",
                "Value": "1"
            }, {
                "Name": "Partially bent",
                "Value": "2"
            }, {
                "Name": "Fully bent with finger flexion",
                "Value": "3"
            }, {
                "Name": "Permanently retracted",
                "Value": "4"
            }]
        });

        var oEOModel = new sap.ui.model.json.JSONModel({
            "EOCollection": [{
                "Name": "Tolerating movement",
                "Value": "1"
            }, {
                "Name": "Coughing but tolerating ventillation most of the time",
                "Value": "2"
            }, {
                "Name": "Fighting ventillator",
                "Value": "3"
            }, {
                "Name": "Unable to control ventillation",
                "Value": "4"
            }]
        });

        sap.ui.getCore().byId("API_PAIN_SCALE_BMR_TABLE").setModel(oMRModel, "MR");
        sap.ui.getCore().byId("API_PAIN_SCALE_BVR_TABLE").setModel(oVRModel, "VR");
        sap.ui.getCore().byId("API_PAIN_SCALE_EO_TABLE").setModel(oEOModel, "EO");

        var oBPModel = new sap.ui.model.json.JSONModel({
            "ScoreModelBPS": [{
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
                },
                "FaceScale": {
                    "Name": "",
                    "Value": ""
                }
            }]
        });
        sap.ui.getCore().byId("API_BPS_PANEL").setModel(oBPModel, "ScoreModelBPS");
        sap.ui.getCore().byId("API_BPS_PANEL").bindElement("ScoreModelBPS>/ScoreModelBPS/0");
        sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").refresh(true);
        sap.ui.getCore().byId("API_BPS_PANEL").setHeaderText("Behaviour Pain Scale (" + sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").getData().ScoreModelBPS[0].TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getBPSInterpretation(parseInt(sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").getData().ScoreModelBPS[0].TotalScore)) + ")");

    },

    // BP scale selection change
    onBPScaleSelectionChange: function(oEvent) {
        var thatPS = this;
        var object;
        var path = oEvent.getSource().getSelectedContextPaths()[0].split("/");
        var model = path[1];
        switch (model) {
            case "MRCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_BMR_TABLE").getModel("MR").getData().MRCollection[path[2]];
                thatPS.modifyBPScaleTotalScore("BestMotorResponse", object);
                break;
            case "VRCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_BVR_TABLE").getModel("VR").getData().VRCollection[path[2]];
                thatPS.modifyBPScaleTotalScore("BestVerbalResponse", object);
                break;
            case "EOCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_EO_TABLE").getModel("EO").getData().EOCollection[path[2]];
                thatPS.modifyBPScaleTotalScore("EyeOpening", object);
                break;
        }
    },

    // BP scale total score
    modifyBPScaleTotalScore: function(path, object) {
        var scoreBPScale = sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").getData().ScoreModelBPS[0];
        scoreBPScale[path].Name = object.Name;
        scoreBPScale[path].Value = object.Value ? object.Value : "";
        if (scoreBPScale.BestMotorResponse.Value && scoreBPScale.BestVerbalResponse.Value && scoreBPScale.EyeOpening.Value)
            scoreBPScale.TotalScore = (parseInt(scoreBPScale.BestMotorResponse.Value) + parseInt(scoreBPScale.BestVerbalResponse.Value) + parseInt(scoreBPScale.EyeOpening.Value)).toString();
        sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").refresh(true);
        sap.ui.getCore().byId("API_BPS_PANEL").setHeaderText("Behaviour Pain Scale (" + scoreBPScale.TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getBPSInterpretation(parseInt(scoreBPScale.TotalScore)) + ")");

    },

    //FLACC scale score values
    initFlaccScaleTotalScore: function() {

        var oFLACCFaceModel = new sap.ui.model.json.JSONModel({
            "FLACCFaceCollection": [{
                "Name": "No particular expression or smile",
                "Value": "0"
            }, {
                "Name": "Occasional grimace or frown, withdrawn, disinterested",
                "Value": "1"
            }, {
                "Name": "Frequent to constant quivering chin, clenched jaw",
                "Value": "2"
            }]
        });

        var oFLACCLegsModel = new sap.ui.model.json.JSONModel({
            "FLACCLegsCollection": [{
                "Name": "Normal Position or relaxed",
                "Value": "0"
            }, {
                "Name": "Uneasy, restless or tensed",
                "Value": "1"
            }, {
                "Name": "Kicking or legs drawn up",
                "Value": "2"
            }]
        });

        var oFLACCActivityModel = new sap.ui.model.json.JSONModel({
            "FLACCActivityCollection": [{
                "Name": "Lying quietly, normal position, moves easily",
                "Value": "0"
            }, {
                "Name": "Squirming, shifting back and forth, tense",
                "Value": "1"
            }, {
                "Name": "Arched, rigid or jerking",
                "Value": "2"
            }]
        });

        var oFLACCCryModel = new sap.ui.model.json.JSONModel({
            "FLACCCryCollection": [{
                "Name": "No Cry (awake or asleep)",
                "Value": "0"
            }, {
                "Name": "Moans or whimpers; occasional complaints",
                "Value": "1"
            }, {
                "Name": "Crying steadily, screams or sobs; frequent complaints",
                "Value": "2"
            }]
        });

        var oFLACCConsolabilityModel = new sap.ui.model.json.JSONModel({
            "FLACCConsolabilityCollection": [{
                "Name": "Content, Relaxed",
                "Value": "0"
            }, {
                "Name": "Reassured by occasional touching, hugging, distractable",
                "Value": "1"
            }, {
                "Name": "Difficult to consult or comfort",
                "Value": "2"
            }]
        });

        sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_FACE_TABLE").setModel(oFLACCFaceModel, "FLACCFACE");
        sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_LEGS_TABLE").setModel(oFLACCLegsModel, "FLACCLEGS");
        sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_ACTIVITY_TABLE").setModel(oFLACCActivityModel, "FLACCACTIVITY");
        sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CRY_TABLE").setModel(oFLACCCryModel, "FLACCCRY");
        sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CONSOLABILITY_TABLE").setModel(oFLACCConsolabilityModel, "FLACCCONSOLABILITY");

        var oFLACCScaleModel = new sap.ui.model.json.JSONModel({
            "FLACCScaleScoreModel": [{
                "TotalScore": "",
                "Face": {
                    "Name": "",
                    "Value": ""
                },
                "Legs": {
                    "Name": "",
                    "Value": ""
                },
                "Activity": {
                    "Name": "",
                    "Value": ""
                },
                "Cry": {
                    "Name": "",
                    "Value": ""
                },
                "Consolability": {
                    "Name": "",
                    "Value": ""
                }
            }]
        });
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").setModel(oFLACCScaleModel, "FLACCScaleScoreModel");
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").bindElement("FLACCScaleScoreModel>/FLACCScaleScoreModel/0");
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").refresh(true);
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").setHeaderText("FLACC Scale (" + sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").getData().FLACCScaleScoreModel[0].TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getFLACCInterpretation(parseInt(sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").getData().FLACCScaleScoreModel[0].TotalScore)) + ")");
    },

    // FLACC selection change
    onFLACCScaleSelectionChange: function(oEvent) {
        var thatPS = this;
        var object;
        var path = oEvent.getSource().getSelectedContextPaths()[0].split("/");
        var model = path[1];
        switch (model) {
            case "FLACCFaceCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_FACE_TABLE").getModel("FLACCFACE").getData().FLACCFaceCollection[path[2]];
                thatPS.modifyFlaccScaleTotalScore("Face", object);
                break;
            case "FLACCLegsCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_LEGS_TABLE").getModel("FLACCLEGS").getData().FLACCLegsCollection[path[2]];
                thatPS.modifyFlaccScaleTotalScore("Legs", object);
                break;
            case "FLACCActivityCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_ACTIVITY_TABLE").getModel("FLACCACTIVITY").getData().FLACCActivityCollection[path[2]];
                thatPS.modifyFlaccScaleTotalScore("Activity", object);
                break;
            case "FLACCCryCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CRY_TABLE").getModel("FLACCCRY").getData().FLACCCryCollection[path[2]];
                thatPS.modifyFlaccScaleTotalScore("Cry", object);
                break;
            case "FLACCConsolabilityCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_FLACC_CONSOLABILITY_TABLE").getModel("FLACCCONSOLABILITY").getData().FLACCConsolabilityCollection[path[2]];
                thatPS.modifyFlaccScaleTotalScore("Consolability", object);
                break;
        }
    },

    // FLACC total score
    modifyFlaccScaleTotalScore: function(path, object) {
        var scoreFlaccScale = sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").getData().FLACCScaleScoreModel[0];
        scoreFlaccScale[path].Name = object.Name;
        scoreFlaccScale[path].Value = object.Value ? object.Value : "";

        if (scoreFlaccScale.Face.Value && scoreFlaccScale.Legs.Value && scoreFlaccScale.Activity.Value && scoreFlaccScale.Cry.Value && scoreFlaccScale.Consolability.Value)
            scoreFlaccScale.TotalScore = (parseInt(scoreFlaccScale.Face.Value) + parseInt(scoreFlaccScale.Legs.Value) + parseInt(scoreFlaccScale.Activity.Value) + parseInt(scoreFlaccScale.Cry.Value) + parseInt(scoreFlaccScale.Consolability.Value)).toString();
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").refresh(true);
        sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").setHeaderText("FLACC Scale (" + scoreFlaccScale.TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getFLACCInterpretation(parseInt(scoreFlaccScale.TotalScore)) + ")");
    },

    //NIP scale score values
    initNipScaleTotalScore: function() {
        var oNIPFacialexpressionModel = new sap.ui.model.json.JSONModel({
            "NIPFacialexpressionCollection": [{
                "Name": "Relaxed muscles",
                "Value": "0"
            }, {
                "Name": "Grimace",
                "Value": "1"
            }]
        });

        var oNIPBreathingPatternModel = new sap.ui.model.json.JSONModel({
            "NIPBreathingPatternCollection": [{
                "Name": "Relaxed",
                "Value": "0"
            }, {
                "Name": "Change in breathing",
                "Value": "1"
            }]
        });

        var oNIPArmsModel = new sap.ui.model.json.JSONModel({
            "NIPArmsCollection": [{
                "Name": "Relaxed",
                "Value": "0"
            }, {
                "Name": "Flexed/extended",
                "Value": "1"
            }]
        });

        var oNIPLegsModel = new sap.ui.model.json.JSONModel({
            "NIPLegsCollection": [{
                "Name": "Relaxed",
                "Value": "0"
            }, {
                "Name": "Flexed/extended",
                "Value": "1"
            }]
        });

        var oNIPStateofArousalModel = new sap.ui.model.json.JSONModel({
            "NIPStateofArousalCollection": [{
                "Name": "Sleeping/Awake",
                "Value": "0"
            }, {
                "Name": "Fussy",
                "Value": "1"
            }]
        });

        var oNIPCryModel = new sap.ui.model.json.JSONModel({
            "NIPCryCollection": [{
                "Name": "No cry",
                "Value": "0"
            }, {
                "Name": "Whimper",
                "Value": "1"
            }, {
                "Name": "Vigorous cry",
                "Value": "2"
            }]
        });

        sap.ui.getCore().byId("API_PAIN_SCALE_NIP_FACIAL_EXPRESSION_TABLE").setModel(oNIPFacialexpressionModel, "NIPFACIALEXPRS");
        sap.ui.getCore().byId("API_PAIN_SCALE_NIP_BREATHING_PATTERN_TABLE").setModel(oNIPBreathingPatternModel, "NIPBRTHNGPATRN");
        sap.ui.getCore().byId("API_PAIN_SCALE_NIP_ARMS_TABLE").setModel(oNIPArmsModel, "NIPARMS");
        sap.ui.getCore().byId("API_PAIN_SCALE_NIP_LEGS_TABLE").setModel(oNIPLegsModel, "NIPLEGS");
        sap.ui.getCore().byId("API_PAIN_SCALE_NIP_STATE_OF_AROUSAL_TABLE").setModel(oNIPStateofArousalModel, "NIPSATEOFARSL");
        sap.ui.getCore().byId("API_PAIN_SCALE_NIP_CRY_TABLE").setModel(oNIPCryModel, "NIPCRY");

        var oNipScaleModel = new sap.ui.model.json.JSONModel({
            "NIPScaleScoreModel": [{
                "TotalScore": "",
                "FacialExpression": {
                    "Name": "",
                    "Value": ""
                },
                "BreathingPattern": {
                    "Name": "",
                    "Value": ""
                },
                "Arms": {
                    "Name": "",
                    "Value": ""
                },
                "Legs": {
                    "Name": "",
                    "Value": ""
                },
                "StateofArousal": {
                    "Name": "",
                    "Value": ""
                },
                "Cry": {
                    "Name": "",
                    "Value": ""
                }
            }]
        });
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").setModel(oNipScaleModel, "NIPScaleScoreModel");
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").bindElement("NIPScaleScoreModel>/NIPScaleScoreModel/0");
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").refresh(true);
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").setHeaderText("Neonatal infant pain scale (" + sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").getData().NIPScaleScoreModel[0].TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getNIPInterpretation(parseInt(sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").getData().NIPScaleScoreModel[0].TotalScore)) + ")");
    },

    //NIP scale selection change
    onNIPScaleSelectionChange: function(oEvent) {
        var thatPS = this;
        var object;
        var path = oEvent.getSource().getSelectedContextPaths()[0].split("/");
        var model = path[1];
        switch (model) {
            case "NIPFacialexpressionCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_FACIAL_EXPRESSION_TABLE").getModel("NIPFACIALEXPRS").getData().NIPFacialexpressionCollection[path[2]];
                thatPS.modifyNIPScaleTotalScore("FacialExpression", object);
                break;
            case "NIPBreathingPatternCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_BREATHING_PATTERN_TABLE").getModel("NIPBRTHNGPATRN").getData().NIPBreathingPatternCollection[path[2]];
                thatPS.modifyNIPScaleTotalScore("BreathingPattern", object);
                break;
            case "NIPArmsCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_ARMS_TABLE").getModel("NIPARMS").getData().NIPArmsCollection[path[2]];
                thatPS.modifyNIPScaleTotalScore("Arms", object);
                break;
            case "NIPLegsCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_LEGS_TABLE").getModel("NIPLEGS").getData().NIPLegsCollection[path[2]];
                thatPS.modifyNIPScaleTotalScore("Legs", object);
                break;
            case "NIPStateofArousalCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_STATE_OF_AROUSAL_TABLE").getModel("NIPSATEOFARSL").getData().NIPStateofArousalCollection[path[2]];
                thatPS.modifyNIPScaleTotalScore("StateofArousal", object);
                break;
            case "NIPCryCollection":
                object = sap.ui.getCore().byId("API_PAIN_SCALE_NIP_CRY_TABLE").getModel("NIPCRY").getData().NIPCryCollection[path[2]];
                thatPS.modifyNIPScaleTotalScore("Cry", object);
                break;
        }
    },

    // NIP total score
    modifyNIPScaleTotalScore: function(path, object) {
        var scoreNIPScale = sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").getData().NIPScaleScoreModel[0];
        scoreNIPScale[path].Name = object.Name;
        scoreNIPScale[path].Value = object.Value ? object.Value : "";
        if (scoreNIPScale.FacialExpression.Value && scoreNIPScale.BreathingPattern.Value && scoreNIPScale.Arms.Value && scoreNIPScale.Legs.Value && scoreNIPScale.StateofArousal.Value && scoreNIPScale.Cry.Value)
            scoreNIPScale.TotalScore = (parseInt(scoreNIPScale.FacialExpression.Value) + parseInt(scoreNIPScale.BreathingPattern.Value) + parseInt(scoreNIPScale.Arms.Value) + parseInt(scoreNIPScale.Legs.Value) + parseInt(scoreNIPScale.StateofArousal.Value) + parseInt(scoreNIPScale.Cry.Value)).toString();
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").refresh(true);
        sap.ui.getCore().byId("API_NIP_SCALE_PANEL").setHeaderText("Neonatal infant pain scale (" + scoreNIPScale.TotalScore + " " + ZHN_API_SCORES.utils.Formatter.getNIPInterpretation(parseInt(scoreNIPScale.TotalScore)) + ")");
    },

    // on save pressed
    _handleAPIPainScaleSavePressed: function() {
        var thatPS = this;
        var faceScaleScoreModel = sap.ui.getCore().byId("API_FACE_SCALE_PANEL").getModel("FaceScaleModel").getData().FaceScaleScore[0];
        var bpsScaleScoreModel = sap.ui.getCore().byId("API_BPS_PANEL").getModel("ScoreModelBPS").getData().ScoreModelBPS[0];
        var flaccScaleScoreModel = sap.ui.getCore().byId("API_FLACC_SCALE_PANEL").getModel("FLACCScaleScoreModel").getData().FLACCScaleScoreModel[0];
        var nipScaleScoreModel = sap.ui.getCore().byId("API_NIP_SCALE_PANEL").getModel("NIPScaleScoreModel").getData().NIPScaleScoreModel[0];
        if (faceScaleScoreModel.Value || bpsScaleScoreModel.TotalScore || flaccScaleScoreModel.TotalScore || nipScaleScoreModel.TotalScore) {

            var data = null;
            var bpsInterpretation = "";
            if (bpsScaleScoreModel.TotalScore <= 3) {
                bpsInterpretation = "No pain";
            } else if (bpsScaleScoreModel.TotalScore >= 4 && bpsScaleScoreModel.TotalScore <= 6) {
                bpsInterpretation = "Mid pain";
            } else if (bpsScaleScoreModel.TotalScore >= 7 && bpsScaleScoreModel.TotalScore <= 9) {
                bpsInterpretation = "Moderate pain";
            } else if (bpsScaleScoreModel.TotalScore >= 9) {
                bpsInterpretation = "Sever pain";
            }

            var flaccInterpretation = "";
            if (flaccScaleScoreModel.TotalScore == 0) {
                flaccInterpretation = "Relaxed and comfortable";
            } else if (flaccScaleScoreModel.TotalScore >= 1 && flaccScaleScoreModel.TotalScore <= 3) {
                flaccInterpretation = "Mild Discomfort";
            } else if (flaccScaleScoreModel.TotalScore >= 4 && flaccScaleScoreModel.TotalScore <= 6) {
                flaccInterpretation = "Moderate Pain";
            } else if (flaccScaleScoreModel.TotalScore >= 7) {
                flaccInterpretation = "Sever Discomfort Pain";
            }

            var nipInterpretation = "";
            if (nipScaleScoreModel.TotalScore == 0) {
                nipInterpretation = "No pain";
            } else if (nipScaleScoreModel.TotalScore >= 1 && nipScaleScoreModel.TotalScore <= 2) {
                nipInterpretation = "Mild Discomfort";
            } else if (nipScaleScoreModel.TotalScore >= 3 && nipScaleScoreModel.TotalScore <= 4) {
                nipInterpretation = "Mild to moderate pain";
            } else if (nipScaleScoreModel.TotalScore >= 5) {
                nipInterpretation = "Moderate to sever pain";
            }

            var scaleUsed = sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").getValue();
            var scaleType = sap.ui.getCore().byId("API_SCALE_TYPE_COMBO").getSelectedKey();
            if (scaleType == "1") {
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
                    SclType: "1",
                    SclImage: "",
                    FaceScale: faceScaleScoreModel.Value,
                    FaceTotalScore: faceScaleScoreModel.Value,
                    FaceInterpretion: faceScaleScoreModel.Name,
                    Institution: "RFH1",
                    DepartmentOu: _patient.DeptOu,
                    EmployeeResp: "",
                    Mode: "",
                    SCPAINDETAILHDRTOITEM: []
                };
            } else if (scaleType == "2") {
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
                    SclType: "2",
                    SclImage: "",
                    FaceExpresion: bpsScaleScoreModel.BestMotorResponse.Value,
                    BpainUpperLimb: bpsScaleScoreModel.BestVerbalResponse.Value,
                    BpainMechVenti: bpsScaleScoreModel.EyeOpening.Value,
                    BpainTotalScore: bpsScaleScoreModel.TotalScore,
                    BpainfaceExpre:  bpsScaleScoreModel.BestMotorResponse.Value,
                    BpainUpLiMov: bpsScaleScoreModel.BestVerbalResponse.Value,
                    BpainInterpretion: bpsInterpretation,
                    BpainCompl: bpsScaleScoreModel.EyeOpening.Value,
                    Institution: "RFH1",
                    DepartmentOu: _patient.DeptOu,
                    EmployeeResp: "",
                    Mode: "",
                    SCPAINDETAILHDRTOITEM: []
                };

            } else if (scaleType == "3") {
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
                    SclType: "3",
                    SclImage: "",
                    PainRadioFace: flaccScaleScoreModel.TotalScore,
                    PainRLeg: flaccScaleScoreModel.Legs.Value,
                    PainRActivity: flaccScaleScoreModel.Activity.Value,
                    PainRCry: flaccScaleScoreModel.Cry.Value,
                    PainRConsol: flaccScaleScoreModel.Consolability.Value,
                    PainTotalScore: flaccScaleScoreModel.TotalScore,
                    PainInterpretion: flaccInterpretation,
                    Face: flaccScaleScoreModel.Face.Value,
                    Legs: flaccScaleScoreModel.Legs.Value,
                    Activity: flaccScaleScoreModel.Activity.Value,
                    Cry: flaccScaleScoreModel.Cry.Value,
                    Consolability: flaccScaleScoreModel.Consolability.Value,
                    Institution: "RFH1",
                    DepartmentOu: _patient.DeptOu,
                    EmployeeResp: "",
                    Mode: "",
                    SCPAINDETAILHDRTOITEM: []
                };

            } else if (scaleType == "4") {
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
                    SclType: "4",
                    SclImage: "",
                    NeoFacial: nipScaleScoreModel.FacialExpression.Value,
                    NeoCry: nipScaleScoreModel.Cry.Value,
                    NeoBreath: nipScaleScoreModel.BreathingPattern.Value,
                    NeoArms: nipScaleScoreModel.Arms.Value,
                    NeoLegs: nipScaleScoreModel.Legs.Value,
                    NeoState: nipScaleScoreModel.StateofArousal.Value,
                    NeoRFacl: nipScaleScoreModel.FacialExpression.Value,
                    NeoRCry: nipScaleScoreModel.Cry.Value,
                    NeoRBret: nipScaleScoreModel.BreathingPattern.Value,
                    NeoRArms: nipScaleScoreModel.Arms.Value,
                    NeoRLegs: nipScaleScoreModel.Legs.Value,
                    NeoRStat: nipScaleScoreModel.StateofArousal.Value,
                    NeoTotalScore: nipScaleScoreModel.TotalScore,
                    NeoInterpretion: nipInterpretation,
                    Institution: "RFH1",
                    DepartmentOu: _patient.DeptOu,
                    EmployeeResp: "",
                    Mode: "",
                    SCPAINDETAILHDRTOITEM: []
                };
            }
            if (_patient.DocumentNo && _patient.Mode == "E") {
                data.Mode = "U";
            } else {
                data.Mode = "C";
            }
            thatPS.oModel.create("/ScPainDetailHdrSet", data, null, function(oData, oResponse) {
                thatPS["PainScaleCreate"].destroy();

                sap.m.MessageToast.show(oResponse.headers["sap-message"]);
                if (thatPS.painScaleDirectRelease) {
                    var docNumber = oResponse.headers["sap-message"].split(" ")[2];
                    var data = {
                    		 "DocumentNumber": docNumber,
                             "DocumentType": _patient.DocumentType ? _patient.DocumentType : "MED",
                             "DocumentVersion": _patient.DocumentVersion ? _patient.DocumentVersion : "00",
                             "DocumentPart": _patient.DocumantPart ? _patient.DocumantPart : "000"
                    };
                    thatPS.oModel.update("PmdReleaseSet('" + docNumber + "')", data, null, function(oData, oResponse) {

                            thatPS.painScaleDirectRelease = false;
                            sap.m.MessageToast.show(oResponse.headers["sap-message"]);
                            var totalScoreValue="";
                            var totalScoreAbrValue="";
                            if(scaleType == "1"){
                            	totalScoreValue = faceScaleScoreModel.Value;
                            	totalScoreAbrValue: faceScaleScoreModel.Name;
                            	
                            }else if (scaleType == "2") {
                            	totalScoreValue =  bpsScaleScoreModel.TotalScore;
                            	totalScoreAbrValue: bpsInterpretation;
                            }else if (scaleType == "3") {
                            	totalScoreValue = flaccScaleScoreModel.TotalScore;
                            	totalScoreAbrValue: flaccInterpretation;
                            }else if (scaleType == "4") {
                            	totalScoreValue = nipScaleScoreModel.TotalScore;
                            	totalScoreAbrValue: nipInterpretation;
                            }
                            
                            var eb = sap.ui.getCore().getEventBus();
                            var returnData = {
                                    "DocumentNumber": docNumber,
                                    "DocumentType": _patient.DocumentType,
                                    "DocumentVersion": _patient.DocumentVersion,
                                    "DocumentPart": _patient.DocumantPart,
                                    "TotalScore": totalScoreValue,
                                    "Interpretation": totalScoreAbrValue,
                                    "ScaleUsed" : scaleUsed
                                };
                            
                            eb.publish("ZHN_API_SCORES", "PainScaleRelease", returnData);
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
            sap.m.MessageToast.show("Please enter scores before saving.");
        }
    },

    // on release pressed
    _handleAPIPainScaleReleasePressed: function() {
        var thatPS = this;
        thatPS.painScaleDirectRelease = true;
        thatPS._handleAPIPainScaleSavePressed();
        thatPS.painScaleDirectRelease = false;
    }
});
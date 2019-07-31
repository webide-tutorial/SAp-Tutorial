// define a root UI component that exposes the main view
jQuery.sap.declare("ZHN_API_SCORES.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

jQuery.sap.require("ZHN_API_SCORES.braden.Braden");
jQuery.sap.require("ZHN_API_SCORES.fallRiskAssessment.FallRiskAssessment");
jQuery.sap.require("ZHN_API_SCORES.glasgowComa.GlasgowComa");
jQuery.sap.require("ZHN_API_SCORES.vip.VIP");
jQuery.sap.require("ZHN_API_SCORES.painScale.PainScale");

sap.ui.core.UIComponent.extend("ZHN_API_SCORES.Component", {
    metadata : {
        "name" : "API",
        "version" : "1.1.0-SNAPSHOT",
        "library" : "ZHN_API_SCORES",
        "includes" : [ "css/fullScreenStyles.css" ],
        "dependencies" : {
            "libs" : [ "sap.m", "sap.ui.layout" ],
            "components" : []
        },
		"config" : {
			resourceBundle : "i18n/i18n.properties",
			serviceConfig : {
				name: "PatientListCollection",
				//serviceUrl: "/sap/opu/odata/MEMR/MOBILE_EMR"
				serviceUrl: "/sap/opu/odata/MEMR/MOBILE_EMR"
			}
		},
        routing : {
           
        }
    },

    /**
     * Initialize the application
     * 
     * @returns {sap.ui.core.Control} the content
     */
    createContent : function() {
       
    },

    init : function() {
        // call super init (will call function "create content")
        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

        // always use absolute paths relative to our own component
        // (relative paths will fail if running in the Fiori Launchpad)
        var sRootPath = jQuery.sap.getModulePath("ZHN_API_SCORES");

        // The service URL for the oData model 
        var oServiceConfig = this.getMetadata().getConfig().serviceConfig;
        var sServiceUrl = oServiceConfig.serviceUrl;

        // the metadata is read to get the location of the i18n language files later
        var mConfig = this.getMetadata().getConfig();
        this._routeMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);

        // create oData model
       // this._initODataModel(sServiceUrl);

        // set i18n model
        var i18nModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl : [ sRootPath, mConfig.resourceBundle ].join("/")
        });
        this.setModel(i18nModel, "i18n");

        var deviceModel = new sap.ui.model.json.JSONModel({
			isPhone : jQuery.device.is.phone,
			isTablet : jQuery.device.is.tablet,
			isDesktop : jQuery.device.is.desktop
		});
		deviceModel.setDefaultBindingMode("OneWay");
		this.setModel(deviceModel, "device");
		
        // initialize router and navigate to the first page
        this.getRouter().initialize();

    },

    exit : function() {
        this._routeMatchedHandler.destroy();
    },

    // This method lets the app can decide if a navigation closes all open dialogs
    setRouterSetCloseDialogs : function(bCloseDialogs) {
        this._bRouterCloseDialogs = bCloseDialogs;
        if (this._routeMatchedHandler) {
            this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
        }
    },

    // creation and setup of the oData model
    _initODataModel : function(sServiceUrl) {
       /* jQuery.sap.require("ZHN_API_SCORES.util.messages");
        var oConfig = {
            metadataUrlParams : {},
            json : true,
            // loadMetadataAsync : true,
            defaultBindingMode :"TwoWay",
            defaultCountMode: "Inline",
            useBatch : true
        };
        var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, oConfig);
        oModel.attachRequestFailed(null, ZHN_API_SCORES.util.messages.showErrorMessage);
        this.setModel(oModel);*/
    }
});
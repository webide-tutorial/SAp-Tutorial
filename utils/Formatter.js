jQuery.sap.declare("ZHN_API_SCORES.utils.Formatter");
jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
ZHN_API_SCORES.utils.Formatter =  {
		
				//get braden interpretation
				getBradenInterpretation : function(oValue){
					if(oValue){
						if(oValue <= 9){
							return "Very high risk";
						}else if (oValue >= 10 && oValue <= 12) {
			                return "High risk";
			            } else if (oValue >= 13 && oValue <= 14) {
			                return "Moderate risk";
			            } else if (oValue >= 15 && oValue <= 18) {
			                return "Mild risk";
			            } else if (oValue >= 19) {
			                return "No risk";
			            }
					}else{
                  	  return "";
                    }
				},
				
				// get FRA interpretation
				getFRAInterpretation : function(oValue){
					if(oValue){
						 if (oValue <= 5) {
			                   return "Low Risk";
			                } else if (oValue >= 6 && oValue <= 13) {
			                   return "Moderate Risk";
			                } else if (oValue >= 14) {
			                   return "High Risk";
			                }
					}else{
                  	  return "";
                    }
				},
				
				// get GCS interpretation
				getGCSInterpretation : function(oValue){
					if(oValue){
						 if (oValue < 9) {
				                return "Severe";
				            } else if (oValue >= 9 || oValue < 13) {
				                return "Moderate";
				            } else if (oValue >= 13) {
				                return "Minor";
				            }
					}else{
                  	  return "";
                    }
				},
				
				// pain scale for bps
                getBPSInterpretation : function(oValue){
                       if(oValue){
                              if (oValue <= 3) {
                          return "- No pain";
                      } else if (oValue >= 4 && oValue <= 6) {
                          return "- Mid pain";
                      } else if (oValue >= 7 && oValue <= 9) {
                          return "- Moderate pain";
                      } else if (oValue > 9) {
                          return "- Sever pain";
                      }
                       }else{
                     	  return "";
                       }
                },
                
                // pain scale for flacc
                getFLACCInterpretation : function(oValue){
                       if(oValue){
                              if (oValue == 0) {
                          return "- Relaxed and comfortable";
                      } else if (oValue >= 1 && oValue <= 3) {
                          return "- Mild Discomfort";
                      } else if (oValue >= 4 && oValue <= 6) {
                          return "- Moderate Pain";
                      } else if (oValue >= 7) {
                          return "- Sever Discomfort Pain";
                      }
                       }else{
                     	  return "";
                       }
                
                },
                
                // pain scale for flacc
                getNIPInterpretation : function(oValue){
                       if(oValue){
                              if (oValue == 0) {
                                return "- No pain";
                            } else if (oValue >= 1 && oValue <= 2) {
                                return "- Mild Discomfort";
                            } else if (oValue >= 3 && oValue <= 4) {
                                return "- Mild to moderate pain";
                            } else if (oValue >= 5) {
                                return "- Moderate to sever pain";
                            }
                       }else{
                       	  return "";
                       }
                
                }

					}
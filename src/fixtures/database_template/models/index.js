const MuserModel = require("./MuserModel");
const MadminModel = require("./MadminModel");
const MappconfigModel = require("./MappconfigModel");
const MTokenModel = require("./TokenModel");
const McountryModel = require("./McountryModel");
const McountrylangModel = require("./McountrylangModel");
const McityModel = require("./McityModel");
const McitylangModel = require("./McitylangModel");
const MareaModel = require("./MareaModel");
const MarealangModel = require("./MarealangModel");
const MvendorstatusModel = require("./MvendorstatusModel");
const MvendorModel = require("./MvendorModel");
const MvendorlangModel = require("./MvendorlangModel");
const MvendorimageModel = require("./MvendorimageModel");
const MvendorcategoryModel = require("./MvendorcategoryModel");
const McategoryModel = require("./McategoryModel");
const McategorylangModel = require("./McategorylangModel");
const MserviceModel = require("./MserviceModel");
const MservicelangModel = require("./MservicelangModel");
const MservicepriceModel = require("./MservicepriceModel");
const MservicestaffModel = require("./MservicestaffModel");
const MourserviceModel = require("./MourserviceModel");
const TreviewModel = require("./TreviewModel");
const MfavouriteModel = require("./MfavouritesModel");
const MvoucherModel = require("./MvoucherModel");
const MapptypeModel = require("./MapptypeModel");
const MvouchertypeModel = require("./MvouchertypeModel");
const MvendorvoucherModel = require("./MvendorvoucherModel");
const MuservoucherModel = require("./MuservoucherModel");
const Tbookingmodel = require("./TbookingModel");
const Tbookingtimemodel = require("./TbookingtimeModel");
const Tbookingsublistmodel = require("./TbookingsublistModel");
const Tusedvouchermodel = require("./TusedvoucherModel");
const MdiscounttypeModel = require("./MdiscounttypeModel");
const MpaymentmethodModel = require("./MpaymentmethodModel");
const MvatModel = require("./MvatModel");
const MaboutusModel = require("./MaboutusModel");
const MaboutuslangModel = require("./MaboutuslangModel");
const MnewslettersubscribeModel = require("./MnewslettersubscribeModel");
const MnewsletterModel = require("./MnewsletterModel");
const MbookingstatusModel = require("./MbookingstatusModel");
const McontactusModel = require("./McontactusModel");
const MlanguageModel = require("./MlanguageModel");
const MsmtpModel = require("./MsmtpModel");
const MsmsModel = require("./MsmsModel");
const MsocialmediaModel = require("./MsocialmediaModel");
const MroleModel = require("./MroleModel");
const MroleuserModel = require("./MroleuserModel");
const MrolemoduleModel = require("./MrolemoduleModel");
const MrolemodulelangModel = require("./MrolemodulelangModel");
const MpermissionModel = require("./MpermissionModel");
const McmsModel = require("./McmsModel");
const McmslangModel = require("./McmslangModel");
const MfaqModel = require("./MfaqModel");
const MfaqlangModel = require("./MfaqlangModel");
const MactivitylogModel = require("./MactivitylogModel");
const MpackageModel = require("./MpackageModel");
const MpackagelangModel = require("./MpackagelangModel");
const MvendorhoursModel = require("./MvendorhoursModel");
const MadmincommissionModel = require("./MadmincommissionModel");
const MvendorstaffhoursModel = require("./MvendorstaffhoursModel");
const MvendorstafflangModel = require("./MvendorstafflangModel");
const MvendorstaffModel = require("./MvendorstaffModel");
const MvendorstaffserviceModel = require("./MvendorstaffserviceModel");
const MserviceavailableModel = require("./MserviceavailableModel");
const MbookingaddressModel = require("./MbookingaddressModel");
const MpartneraccountModel = require("./MpartneraccountModel");
const MsettingsModel = require("./MsettingsModel");
const MpartnerimageModel = require("./MpartnerimageModel");
const MpartnerhoursModel = require("./MpartnerhoursModel");
const MtransactionModel = require("./MtransactionModel");
const MsplitpayauthModel = require("./Msplitpayauth");
const MpartnerstaffModel = require("./MpartnerstaffModel");
const MparterstafflangModel = require("./MpartnerstafflangModel");
const MpartnerstaffhoursModel = require("./MpartnerstaffhoursModel");
const MpartnerstafflangModel = require("./MpartnerstafflangModel");
const MpartnercategoryModel = require("./MpartnercategoryModel");
const MnotificationModel = require("./MnotificationModel");
const MnotificationuserModel = require("./MnotificationuserModel");

module.exports = {
	Muser: MuserModel,
	Madmin: MadminModel,
	Mtoken: MTokenModel,
	Mcountry: McountryModel,
	Mcountrylang: McountrylangModel,
	Mcity: McityModel,
	Mcitylang: McitylangModel,
	Marea: MareaModel,
	Marealang: MarealangModel,
	Mvendorstatus: MvendorstatusModel,
	Mvendor: MvendorModel,
	Mvendorlang: MvendorlangModel,
	Mvendorcategory: MvendorcategoryModel,
	Mcategory: McategoryModel,
	Mcategorylang: McategorylangModel,
	Mservice: MserviceModel,
	Mservicelang: MservicelangModel,
	Mserviceprice: MservicepriceModel,
	Mservicestaff: MservicestaffModel,
	Mourservice: MourserviceModel,
	Mvendorimage: MvendorimageModel,
	Treview: TreviewModel,
	Mfavourite: MfavouriteModel,
	Mvoucher: MvoucherModel,
	Tbooking : Tbookingmodel,
	Tbookingtime : Tbookingtimemodel,
	Tbookingsublist : Tbookingsublistmodel,
	Tusedvoucher : Tusedvouchermodel,
	Mdiscounttype: MdiscounttypeModel,
	Mpaymentmethod: MpaymentmethodModel,
	Mvat: MvatModel,
	Maboutus: MaboutusModel,
	Maboutuslang: MaboutuslangModel,
	Mnewslettersubscribe: MnewslettersubscribeModel,
	Mbookingstatus: MbookingstatusModel,
	Mcontactus: McontactusModel,
	Mlanguage: MlanguageModel,
	Msmtp: MsmtpModel,
	Msms: MsmsModel,
	Msocialmedia: MsocialmediaModel,
	Mrole: MroleModel,
	Mroleuser: MroleuserModel,
	Mrolemodule: MrolemoduleModel,
	Mrolemodulelang: MrolemodulelangModel,
	Mappconfig: MappconfigModel,
	Mpermission: MpermissionModel,
	Mcms: McmsModel,
	Mcmslang: McmslangModel,
	Mfaq: MfaqModel,
	Mfaqlang: MfaqlangModel,
	Mactivitylog: MactivitylogModel,
	Mapptype: MapptypeModel,
	Mvouchertype: MvouchertypeModel,
	Mvendorvoucher: MvendorvoucherModel,
	Muservoucher: MuservoucherModel,
	Mpackage: MpackageModel,
	Mpackagelang: MpackagelangModel,
	Mvendorhours: MvendorhoursModel,
	Madmincommission : MadmincommissionModel,
	Mnewsletter : MnewsletterModel,
	Mvendorstaffhours: MvendorstaffhoursModel,
	Mvendorstafflang: MvendorstafflangModel,
	Mvendorstaff: MvendorstaffModel,
	Mvendorstaffservice: MvendorstaffserviceModel,
	Mserviceavailable: MserviceavailableModel,
	Mbookingaddress: MbookingaddressModel,
	Mpartneraccount: MpartneraccountModel,
	Msettings: MsettingsModel,
	Mpartnerimage: MpartnerimageModel,
	Mpartnerhours: MpartnerhoursModel,
	Mtransaction: MtransactionModel,
	Msplitpayauth: MsplitpayauthModel,
	Mpartnerstaff: MpartnerstaffModel,
	Mpartnerstafflang: MpartnerstafflangModel,
	Mpartnerstaffhours: MpartnerstaffhoursModel,
	Mpartnercategory: MpartnercategoryModel,
	Mnotification: MnotificationModel,
	Mnotificationuser: MnotificationuserModel,
};

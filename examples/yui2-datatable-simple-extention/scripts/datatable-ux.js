//------------------------------------------------------------
// START YUI DataTable CellEditor Extention
//------------------------------------------------------------
   var lang = YAHOO.lang,
	   util = YAHOO.util,
	   widget = YAHOO.widget,
	   Dom = util.Dom,
	   Event = util.Event;

   var fnRenderForm = function(container, el) {
		var oHd = document.createElement('DIV');
		container.insertBefore(oHd, el);
		oHd.id = container.id + '_admin_editor_head';
		Dom.addClass(oHd, 'admin-editor-hd');

		var oCurrNode = document.createElement('DIV');
		container.insertBefore(oCurrNode, el);
		oCurrNode.innerHTML = 'Current node: ' + Dom.get('node-depths').innerHTML;
		Dom.addClass(oCurrNode, 'admin-editor-pd');

		var oApply = document.createElement('DIV');
		container.appendChild(oApply);
		oApply.innerHTML = Dom.get('node-apply-wrap').innerHTML;
		Dom.addClass(oApply, 'admin-editor-fieldset');
   };

   var fnMove = function(el) {
		el.style.width = '385px';
		Dom.addClass(el, 'admin-editor-pd');               
   };

   var Gcc = {
	   admin: {}
   };

   // extend TextboxCellEditor
   Gcc.admin.TextboxCellEditor = function(config) {
	   Gcc.admin.TextboxCellEditor.superclass.constructor.call(this, config);
   };
   lang.extend(Gcc.admin.TextboxCellEditor, widget.TextboxCellEditor, {
	   renderForm : function() {
		   Gcc.admin.TextboxCellEditor.superclass.renderForm.call(this);
		   fnRenderForm(this.getContainerEl(), this.textbox);
	   },

	   move : function() {
		   Gcc.admin.TextboxCellEditor.superclass.move.call(this);
		   fnMove(this.textbox);
	   }
   });

   // extend DropdownCellEditor
   Gcc.admin.DropdownCellEditor = function(config) {
	   Gcc.admin.DropdownCellEditor.superclass.constructor.call(this, config);
   };
   lang.extend(Gcc.admin.DropdownCellEditor, widget.DropdownCellEditor, {
	   renderForm : function() {
		   Gcc.admin.DropdownCellEditor.superclass.renderForm.call(this);
		   fnRenderForm(this.getContainerEl(), this.dropdown);
	   },

	   move : function() {
		   Gcc.admin.DropdownCellEditor.superclass.move.call(this);
		   fnMove(this.dropdown);
		   Dom.addClass(this.dropdown, 'admin-editor-dropdown');
	   }
   });

   // extend RadioCellEditor
   Gcc.admin.RadioCellEditor = function(config) {
	   Gcc.admin.RadioCellEditor.superclass.constructor.call(this, config);
   };
   lang.extend(Gcc.admin.RadioCellEditor, widget.RadioCellEditor, {
	   renderForm : function() {
		   Gcc.admin.RadioCellEditor.superclass.renderForm.call(this);
		   var oFirstRadio = Dom.get(this.getId() + '-radio0');
		   Dom.addClass(oFirstRadio, 'admin-editor-radio');
		   fnRenderForm(this.getContainerEl(), oFirstRadio);
	   },

	   move : function() {
		   Gcc.admin.RadioCellEditor.superclass.move.call(this);
	   }
   });
//------------------------------------------------------------
// END YUI DataTable CellEditor Extention
//------------------------------------------------------------ 

	var formatName = function(elCell, oRecord, oColumn, oData) {
		var a = document.createElement("a");
		a.href = "javascript:void(0);";
		a.innerHTML = oRecord.getData("Name");
		a.id =  oRecord.getData("Name");
		a.title = oRecord.getData("Description");
		a.className = "yui-skin-sam ";
		elCell.appendChild(a);
	};

	var formatValue = function(elCell, oRecord, oColumn, oData) {
		if (oRecord.getData("Readable")=="false") {
			elCell.innerHTML="<span style='color: #AAAAAA'>***NOT READABLE***</span>";
			return;
		}

		if (oRecord.getData("Type") == 4) {
			if (oData == 1) elCell.innerHTML="True";
			else
				elCell.innerHTML="False";
		}
		else if (oRecord.getData("Type") == 8) {
			var domain = oRecord.getData('Domain');
			if (domain != null) {
				for(var i=0;i<domain.length;i++) {
					if (domain[i].value == oData) {
						elCell.innerHTML=domain[i].label;
						break;
					}
				};
			}
			else {
				elCell.innerHTML=oData;
			}
		}
		else {
			elCell.innerHTML=oData;
		}
	};

	Event.addListener(window, "load", function() {
		var localJSON = function() {
			var myDataSource, myDataTable;

			var editors = {
				1 : new Gcc.admin.TextboxCellEditor()
				,2: new Gcc.admin.TextboxCellEditor({validator:function (val,curVal,editorInstance) {
						if (/^-?\d*$/.test(val)) {return val;}
						else {
							if (lang.isUndefined(editorInstance.errMsgDiv))
							{
								editorInstance.errMsgDiv = editorInstance.getContainerEl().appendChild(document.createElement("div"));
							}
							editorInstance.errMsgDiv.innerHTML = "Must be a numeric value.";
						}
					}})
				,3: new Gcc.admin.TextboxCellEditor({validator:function (val,curVal,editorInstance) {
						if (/^\d*$/.test(val)) {return val;}
						else {
							if (lang.isUndefined(this.errMsgDiv))
							{
								this.errMsgDiv = editorInstance.getContainerEl().appendChild(document.createElement("div"));
							}
							this.errMsgDiv.innerHTML = "Must be a numeric value.";
						}
					}})
				,4 : new Gcc.admin.RadioCellEditor({radioOptions:[{label:"yes",value:'1'},{label:"no",value:'0'}]})
			};

			var myColumnDefs = [
				{
					key :"Name",
					label :"Property Name",
					resizeable :true,
					sortable :true
					,formatter: formatName
				},
				{
					key :"Value",
					editor : new widget.BaseCellEditor(),
					resizeable :true,
					sortable :true,
					formatter: formatValue
				},
				{
					key :"Revert",
					label :"Remark",
					resizeable :true,
					sortable :false,
					formatter: null
				}
			];

			var evalParser = function(oData) {
				return eval(oData);
			};
			
			// for local testing
			myDataSource = fnSetDataSource();

			myDataSource.responseType = util.DataSource.TYPE_JSON;
			myDataSource.responseSchema = {
				resultsList :"PropertySet.Property",
				fields : [ "Id","Name", {key: "Type", parser : "number"} , "Value","DefaultValue","Description","ApplyFrom","ApplyTo",{key: "Domain", parser:evalParser},{key: "Rule", parser:evalParser},"RuleMsg",{key: "Readable", parser : "string"},{key: "Writable", parser : "string"}]
			};

			myDataTable = new widget.DataTable(
				"yui-datatable",
				myColumnDefs,
				myDataSource,
				{
					selectionMode: 'single'
				}
			);

			myDataTable.subscribe('rowClickEvent', myDataTable.onEventSelectRow);

			myDataTable.subscribe("cellClickEvent", function (oArgs) {
				var target = oArgs.target,
				record = this.getRecord(target),
				column = this.getColumn(target),
				type = record.getData('Type'),
				propName = record.getData('Name');

				if (column.editor == null ) return;

				if (record.getData('Writable')=='false') return;

				if (type == 8){ // This is a drop down
					var domain = record.getData('Domain');
					column.editor = new Gcc.admin.DropdownCellEditor({disableBtns: false,dropdownOptions:domain});
				} else {
					// default editors
					column.editor = editors[type];
				}

				// Reset the err msg if any
				if (!lang.isUndefined(column.editor.errMsgDiv)) {
					column.editor.errMsgDiv.innerHTML  = '';
				}

				// Save the original
				if (lang.isUndefined(column.editor.original_validator)) {
					column.editor.original_validator = column.editor.validator;
				}

				// Is there a reg ex ?
				var rule = record.getData('Rule');

				if (rule != null) {
					var msg = record.getData('RuleMsg');
					column.editor.validator =  function (val,curVal,editorInstance) {
						if (lang.isUndefined(editorInstance.errMsgDiv)) {
							editorInstance.errMsgDiv = editorInstance.getContainerEl().appendChild(document.createElement("div"));
						}
						var errMsgDiv = editorInstance.errMsgDiv;

						if (rule.test(val)) {
							return val;
						} else {
							errMsgDiv.innerHTML = msg.replace(/(\{0\})/i,val);
						}
					};
				}
				else {
					column.editor.validator = column.editor.original_validator;
				}

				column.editor.subscribe("saveEvent", this._onEditorSaveEvent, this, true);
				Dom.get("output").innerHTML = "";

				this.showCellEditor(target);

				var oHd = Dom.get(column.editor.getId() + '-container_admin_editor_head');
				if(oHd) {
					oHd.innerHTML = 'Property: ' + '"' + propName + '"';
				}
			});

			var saveProperty = function(oArgs){
				var oEditor = oArgs.editor;
				var elTd = oEditor.getTdEl();
				var oRecord = this.getRecord(elTd);
				var propName = oRecord.getData('Name');
				var newData = oArgs.newData;
				var oldData = oArgs.oldData;

				if (newData == oldData) return;

				oRecord.setData("ApplyFrom",oRecord.getData("ApplyTo"));
				oEditor.getDataTable().render();
			};

			// Assign the handler to the Custom Event
			myDataTable.subscribe("editorSaveEvent", saveProperty);

			return {
				oDS :myDataSource,
				oDT :myDataTable
			};

		}();
	});

    var fnSetDataSource = function() {
		// for local testing
        return new util.LocalDataSource({PropertySet:{Property:[{Id:"-1",Name:"account_code",Type:"2",Value:"0",Description:"account_code",ApplyFrom:"10676",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"account_reg_email_from",Type:"1",Value:"AccountRegEmailFrom@reg.com",Description:"account_reg_email_from",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_domestic_dialout",Type:"4",Value:"0",Description:"ACE domestic dialout flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_email_language",Type:"1",Value:"EN",Description:"ACE email language",ApplyFrom:"1000",ApplyTo:"10676",Rule:"/^.{0,20}$/",RuleMsg:"invalid ace_email_language",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_international_dialout",Type:"4",Value:"0",Description:"ACE international dialout flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_lecture",Type:"4",Value:"1",Description:"ACE lecture mode flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_multiple_leaders",Type:"4",Value:"0",Description:"ACE allow multiple_leaders flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_operator_request",Type:"8",Value:"1",Description:"ACE operator request flag",ApplyFrom:"1000",ApplyTo:"10676",Domain:'[{label:"neither", value:"2"},{label:"subscriber and participants", value:"1"},{label:"subscriber only", value:"0"}]',Rule:"/^\\d{1,4}$/",RuleMsg:"invalid ace_operator_request",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_phone_country_code",Type:"8",Value:"US",Description:"ACE phone dialing code",ApplyFrom:"1000",ApplyTo:"10676",Domain:'[{label:"VANUATU", value:"VU"},{label:"VIET NAM", value:"VN"},{label:"ECUADOR", value:"EC"},{label:"VIRGIN ISLANDS (USA)", value:"VI"},{label:"ALGERIA", value:"DZ"},{label:"VIRGIN ISLANDS (BRITISH)", value:"VG"},{label:"VENEZUELA", value:"VE"},{label:"DOMINICA", value:"DM"},{label:"SAINT VINCENT AND GRENADINES", value:"VC"},{label:"DOMINICAN REPUBLIC", value:"DO"},{label:"HOLY SEE (VATICAN CITY STATE)", value:"VA"},{label:"GERMANY", value:"DE"},{label:"UZBEKISTAN", value:"UZ"},{label:"URUGUAY", value:"UY"},{label:"DENMARK", value:"DK"},{label:"DJIBOUTI", value:"DJ"},{label:"UNITED STATES", value:"US"},{label:"USA MINOR OUTLYING ISLANDS", value:"UM"},{label:"INTERNATIONAL", value:"UI"},{label:"UNITED KINGDOM", value:"UK"},{label:"UGANDA", value:"UG"},{label:"UKRAINE", value:"UA"},{label:"ETHIOPIA", value:"ET"},{label:"SPAIN", value:"ES"},{label:"ERITREA", value:"ER"},{label:"WESTERN SAHARA", value:"EH"},{label:"EGYPT", value:"EG"},{label:"TANZANIA", value:"TZ"},{label:"ESTONIA", value:"EE"},{label:"TRINIDAD AND TOBAGO", value:"TT"},{label:"TAIWAN", value:"TW"},{label:"TUVALU", value:"TV"},{label:"GRENADA", value:"GD"},{label:"Puerto Rico", value:"XP"},{label:"GEORGIA", value:"GE"},{label:"UNITED KINGDOM", value:"XQ"},{label:"FRENCH GUYANA", value:"GF"},{label:"Holy See (Vatican City State)", value:"XV"},{label:"Wake Island", value:"XW"},{label:"GABON", value:"GA"},{label:"UNITED KINGDOM", value:"GB"},{label:"Midway Island", value:"XM"},{label:"China Non-local Mobile", value:"XC"},{label:"FRANCE", value:"FR"},{label:"Ascension", value:"XA"},{label:"Guantanamo Bay (Cuba)", value:"XG"},{label:"FAROE ISLANDS", value:"FO"},{label:"Dominican Republic", value:"XD"},{label:"FALKLAND ISLANDS", value:"FK"},{label:"FIJI", value:"FJ"},{label:"MICRONESIA", value:"FM"},{label:"FINLAND", value:"FI"},{label:"SAMOA", value:"WS"},{label:"GUYANA", value:"GY"},{label:"GUINEA BISSAU", value:"GW"},{label:"GUAM (USA)", value:"GU"},{label:"GUATEMALA", value:"GT"},{label:"S. GEORGIA AND S. SANDWICH ISLS.", value:"GS"},{label:"GREECE", value:"GR"},{label:"EQUATORIAL GUINEA", value:"GQ"},{label:"WALLIS AND FUTUNA ISLANDS", value:"WF"},{label:"GUADELOUPE (FRENCH)", value:"GP"},{label:"GUINEA", value:"GN"},{label:"GAMBIA", value:"GM"},{label:"GREENLAND", value:"GL"},{label:"GIBRALTAR", value:"GI"},{label:"GHANA", value:"GH"},{label:"REUNION(FRANCE)", value:"RE"},{label:"ROMANIA", value:"RO"},{label:"AUSTRIA", value:"AT"},{label:"AMERICAN SAMOA", value:"AS"},{label:"ARGENTINA", value:"AR"},{label:"ANTARCTICA", value:"AQ"},{label:"&Aring;LAND ISLANDS", value:"AX"},{label:"ARUBA", value:"AW"},{label:"QATAR", value:"QA"},{label:"AUSTRALIA", value:"AU"},{label:"AZERBAIDJAN", value:"AZ"},{label:"BOSNIA-HERZEGOVINA", value:"BA"},{label:"PORTUGAL", value:"PT"},{label:"ANDORRA, PRINCIPALITY OF", value:"AD"},{label:"PALAU", value:"PW"},{label:"ANTIGUA AND BARBUDA", value:"AG"},{label:"UNITED ARAB EMIRATES", value:"AE"},{label:"PUERTO RICO", value:"PR"},{label:"AFGHANISTAN, ISLAMIC STATE OF", value:"AF"},{label:"PALESTINIAN TERRITORY, OCCUPIED", value:"PS"},{label:"ALBANIA", value:"AL"},{label:"ANGUILLA", value:"AI"},{label:"ANGOLA", value:"AO"},{label:"PARAGUAY", value:"PY"},{label:"ARMENIA", value:"AM"},{label:"NETHERLANDS ANTILLES", value:"AN"},{label:"TOGO", value:"TG"},{label:"BOTSWANA", value:"BW"},{label:"FRENCH ANTILLES", value:"TF"},{label:"BOUVET ISLAND", value:"BV"},{label:"BELARUS", value:"BY"},{label:"CHAD", value:"TD"},{label:"TOKELAU", value:"TK"},{label:"BAHAMAS", value:"BS"},{label:"TADJIKISTAN", value:"TJ"},{label:"BRAZIL", value:"BR"},{label:"THAILAND", value:"TH"},{label:"BHUTAN", value:"BT"},{label:"TONGA", value:"TO"},{label:"TUNISIA", value:"TN"},{label:"TURKMENISTAN", value:"TM"},{label:"TIMOR-LESTE", value:"TL"},{label:"CANADA", value:"CA"},{label:"TURKEY", value:"TR"},{label:"BELIZE", value:"BZ"},{label:"BURKINA FASO", value:"BF"},{label:"EL SALVADOR", value:"SV"},{label:"BULGARIA", value:"BG"},{label:"BAHRAIN", value:"BH"},{label:"SAINT TOME (SAO TOME) AND PRINCIPE", value:"ST"},{label:"BURUNDI", value:"BI"},{label:"SYRIA", value:"SY"},{label:"BARBADOS", value:"BB"},{label:"SWAZILAND", value:"SZ"},{label:"BANGLADESH", value:"BD"},{label:"BELGIUM", value:"BE"},{label:"BRUNEI DARUSSALAM", value:"BN"},{label:"BOLIVIA", value:"BO"},{label:"BENIN", value:"BJ"},{label:"TURKS AND CAICOS ISLANDS", value:"TC"},{label:"BERMUDA", value:"BM"},{label:"CZECH REPUBLIC", value:"CZ"},{label:"SUDAN", value:"SD"},{label:"CYPRUS", value:"CY"},{label:"SEYCHELLES", value:"SC"},{label:"CHRISTMAS ISLAND", value:"CX"},{label:"SWEDEN", value:"SE"},{label:"SAINT HELENA", value:"SH"},{label:"CAPE VERDE", value:"CV"},{label:"CUBA", value:"CU"},{label:"SINGAPORE", value:"SG"},{label:"SVALBARD AND JAN MAYEN ISLANDS", value:"SJ"},{label:"SLOVENIA", value:"SI"},{label:"SERBIA AND MONTENEGRO", value:"CS"},{label:"SIERRA LEONE", value:"SL"},{label:"SLOVAK REPUBLIC", value:"SK"},{label:"SENEGAL", value:"SN"},{label:"SAN MARINO", value:"SM"},{label:"SOMALIA", value:"SO"},{label:"SURINAME", value:"SR"},{label:"IVORY COAST (COTE D\'IVOIRE)", value:"CI"},{label:"SERBIA", value:"RS"},{label:"CONGO", value:"CG"},{label:"SWITZERLAND", value:"CH"},{label:"RUSSIAN FEDERATION", value:"RU"},{label:"CENTRAL AFRICAN REPUBLIC", value:"CF"},{label:"RWANDA", value:"RW"},{label:"COCOS (KEELING) ISLANDS", value:"CC"},{label:"CONGO, THE DEMOCRATIC REPUBLIC OF THE", value:"CD"},{label:"COSTA RICA", value:"CR"},{label:"COLOMBIA", value:"CO"},{label:"CAMEROON", value:"CM"},{label:"CHINA", value:"CN"},{label:"COOK ISLANDS", value:"CK"},{label:"SAUDI ARABIA", value:"SA"},{label:"CHILE", value:"CL"},{label:"SOLOMON ISLANDS", value:"SB"},{label:"LATVIA", value:"LV"},{label:"LUXEMBOURG", value:"LU"},{label:"LITHUANIA", value:"LT"},{label:"LIBYA", value:"LY"},{label:"LESOTHO", value:"LS"},{label:"LIBERIA", value:"LR"},{label:"MADAGASCAR", value:"MG"},{label:"MARSHALL ISLANDS", value:"MH"},{label:"MONTENEGRO", value:"ME"},{label:"MACEDONIA", value:"MK"},{label:"MALI", value:"ML"},{label:"MONACO", value:"MC"},{label:"MOLDAVIA", value:"MD"},{label:"MOROCCO", value:"MA"},{label:"MALDIVES", value:"MV"},{label:"MAURITIUS", value:"MU"},{label:"MEXICO", value:"MX"},{label:"MALAWI", value:"MW"},{label:"MOZAMBIQUE", value:"MZ"},{label:"MALAYSIA", value:"MY"},{label:"MONGOLIA", value:"MN"},{label:"MYANMAR", value:"MM"},{label:"NORTHERN MARIANA ISLANDS", value:"MP"},{label:"MACAU", value:"MO"},{label:"MAURITANIA", value:"MR"},{label:"MARTINIQUE (FRENCH)", value:"MQ"},{label:"MALTA", value:"MT"},{label:"MONTSERRAT", value:"MS"},{label:"NORFOLK ISLAND", value:"NF"},{label:"NIGERIA", value:"NG"},{label:"NICARAGUA", value:"NI"},{label:"NETHERLANDS", value:"NL"},{label:"NAMIBIA", value:"NA"},{label:"NEW CALEDONIA (FRENCH)", value:"NC"},{label:"NIGER", value:"NE"},{label:"NEW ZEALAND", value:"NZ"},{label:"NIUE", value:"NU"},{label:"NAURU", value:"NR"},{label:"NEPAL", value:"NP"},{label:"NORWAY", value:"NO"},{label:"OMAN", value:"OM"},{label:"POLAND", value:"PL"},{label:"SAINT PIERRE AND MIQUELON", value:"PM"},{label:"PITCAIRN ISLAND", value:"PN"},{label:"PHILIPPINES", value:"PH"},{label:"PAKISTAN", value:"PK"},{label:"PERU", value:"PE"},{label:"POLYNESIA (FRENCH)", value:"PF"},{label:"PAPUA NEW GUINEA", value:"PG"},{label:"PANAMA", value:"PA"},{label:"HONG KONG", value:"HK"},{label:"SOUTH AFRICA", value:"ZA"},{label:"HONDURAS", value:"HN"},{label:"HEARD AND MCDONALD ISLANDS", value:"HM"},{label:"CROATIA", value:"HR"},{label:"HAITI", value:"HT"},{label:"HUNGARY", value:"HU"},{label:"ZAMBIA", value:"ZM"},{label:"ZIMBABWE", value:"ZW"},{label:"INDONESIA", value:"ID"},{label:"IRELAND", value:"IE"},{label:"ISRAEL", value:"IL"},{label:"INDIA", value:"IN"},{label:"BRITISH INDIAN OCEAN TERRITORY", value:"IO"},{label:"IRAQ", value:"IQ"},{label:"IRAN", value:"IR"},{label:"YEMEN", value:"YE"},{label:"ICELAND", value:"IS"},{label:"ITALY", value:"IT"},{label:"MAYOTTE", value:"YT"},{label:"JAPAN", value:"JP"},{label:"JORDAN", value:"JO"},{label:"JAMAICA", value:"JM"},{label:"KIRIBATI", value:"KI"},{label:"CAMBODIA, KINGDOM OF", value:"KH"},{label:"KYRGYZ REPUBLIC (KYRGYZSTAN)", value:"KG"},{label:"KENYA", value:"KE"},{label:"NORTH KOREA", value:"KP"},{label:"SOUTH KOREA", value:"KR"},{label:"COMOROS", value:"KM"},{label:"SAINT KITTS AND NEVIS ANGUILLA", value:"KN"},{label:"KUWAIT", value:"KW"},{label:"CAYMAN ISLANDS", value:"KY"},{label:"KAZAKHSTAN", value:"KZ"},{label:"LAOS", value:"LA"},{label:"SAINT LUCIA", value:"LC"},{label:"LEBANON", value:"LB"},{label:"LIECHTENSTEIN", value:"LI"},{label:"SRI LANKA", value:"LK"}]',Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_phone_pac",Type:"4",Value:"0",Description:"ACE account code flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_quick_start",Type:"4",Value:"0",Description:"ACE quick start flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_security",Type:"8",Value:"0",Description:"ACE security mode flag",ApplyFrom:"1000",ApplyTo:"10676",Domain:'[{label:"mandatory", value:"2"},{label:"optional", value:"1"},{label:"disabled", value:"0"}]',Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_sub_conference",Type:"4",Value:"0",Description:"ACE sub conference flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_subscription_level",Type:"2",Value:"0",Description:"ACE subscription level",ApplyFrom:"1000",ApplyTo:"10676",Rule:"/^\\d{1,3}$/",RuleMsg:"invalid ace_subscription_level",Readable:"true",Writable:"true"},{Id:"-1",Name:"ace_waiting_room",Type:"4",Value:"0",Description:"ACE waiting room flag",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"publish_resolutions",Type:"1",Value:"453,340=800 x 600;673,505=1024 x 768;935,526=1280 x 720;935,748=1280 x 1024;1094,684=1440 x 900;1334,834=1680 x 1050",Description:"publish_resolutions",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_atlas3",Type:"4",Value:"1",Description:"allow_atlas3",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_dismiss",Type:"4",Value:"1",Description:"allow_dismiss",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_duplicate_email",Type:"4",Value:"1",Description:"allow_duplicate_email",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_edit_meeting_topic",Type:"4",Value:"1",Description:"if 1 indicates moderator can edit meeting topic",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_executable_uploads",Type:"4",Value:"1",Description:"Allow uploading of exe files",ApplyFrom:"10676",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"timezone_id",Type:"8",Value:"5",Description:"timezone_id",ApplyFrom:"10676",ApplyTo:"10676",Domain:'[{label:"(GMT +03:00) Nairobi", value:"35"},{label:"(GMT +03:30) Tehran", value:"36"},{label:"(GMT +03:00) Baghdad, Kuwait, Riyadh", value:"33"},{label:"(GMT +03:00) Moscow, St. Petersburg, Volgograd", value:"34"},{label:"(GMT +04:30) Kabul", value:"39"},{label:"(GMT +04:00) Abu Dhabi, Muscat", value:"37"},{label:"(GMT +04:00) Baku, Tbilisi", value:"38"},{label:"(GMT +06:00) Almaty, Dhaka", value:"43"},{label:"(GMT +05:30) Bombay, Calcutta, Madras, New Delhi", value:"42"},{label:"(GMT +05:00) Islamabad, Karachi, Tashkent", value:"41"},{label:"(GMT +05:00) Ekaterinburg", value:"40"},{label:"(GMT)Casablanca, Monrovia", value:"22"},{label:"(GMT +01:00) Amsterdam, Madrid, Paris", value:"23"},{label:"(GMT +01:00) Belgrade, Sarajevo, Skopje", value:"24"},{label:"(GMT +01:00) Bratislava, Budapest, Warsaw", value:"25"},{label:"(GMT +01:00) Brussels, Berlin, Rome, Vienna", value:"26"},{label:"(GMT +02:00) Athens, Istanbul, Minsk", value:"27"},{label:"(GMT +02:00) Bucharest", value:"28"},{label:"(GMT +02:00) Cairo", value:"29"},{label:"(GMT -10:00) Hawaii", value:"3"},{label:"(GMT -11:00) Midway Island, Samoa", value:"2"},{label:"(GMT -12:00) Eniwetok, Kwajalein", value:"1"},{label:"(GMT -07:00) Arizona", value:"7"},{label:"(GMT +02:00) Harare, Pretoria", value:"30"},{label:"(GMT -07:00) Mountain Time (US and Canada)", value:"6"},{label:"(GMT -08:00) Pacific Time (US and Canada)", value:"5"},{label:"(GMT +02:00) Israel", value:"32"},{label:"(GMT -09:00) Alaska", value:"4"},{label:"(GMT +02:00) Helsinki, Riga, Tallinn", value:"31"},{label:"(GMT -06:00) Guadalajara, Mexico City, Monterrey", value:"9"},{label:"(GMT -06:00) Central Time (US and Canada)", value:"8"},{label:"(GMT +10:00) Vladivostok", value:"59"},{label:"(GMT +10:00) Hobart", value:"58"},{label:"(GMT +10:00) Guam, Port Moresby", value:"57"},{label:"(GMT +10:00) Canberra, Melbourne, Sydney", value:"56"},{label:"(GMT -02:00) Mid-Atlantic", value:"19"},{label:"(GMT +10:00) Brisbane", value:"55"},{label:"(GMT -03:00) Brasilia", value:"17"},{label:"(GMT -03:00) Buenos Aires, Georgetown", value:"18"},{label:"(GMT -04:00) La Paz", value:"15"},{label:"(GMT -03:30) Newfoundland", value:"16"},{label:"(GMT -05:00) Bogata, Lima, Quito", value:"13"},{label:"(GMT -04:00) Atlantic Time (Canada)", value:"14"},{label:"(GMT -05:00) Eastern Time (US and Canada)", value:"11"},{label:"(GMT -05:00) Indiana (East)", value:"12"},{label:"(GMT)Dublin, Edinburgh, Lisbon, London", value:"21"},{label:"(GMT -01:00) Azores, Cape Verde Is.", value:"20"},{label:"(GMT -04:30) Caracas", value:"64"},{label:"(GMT +12:00) Fiji, Kamchatka, Marshall Is.", value:"62"},{label:"(GMT -06:00) Central America", value:"63"},{label:"(GMT +11:00) Magadan, Solomon Is., New Caledonia", value:"60"},{label:"(GMT +12:00) Auckland, Wellington", value:"61"},{label:"(GMT +08:00) Taipei", value:"49"},{label:"(GMT +08:00) Singapore", value:"48"},{label:"(GMT +07:00) Bangkok, Hanoi, Jakarta", value:"45"},{label:"(GMT +06:00) Colombo", value:"44"},{label:"(GMT +08:00) Perth", value:"47"},{label:"(GMT +08:00) Beijing, Chongqing, Hong Kong, Urumqi", value:"46"},{label:"(GMT -06:00) Saskatchewan", value:"10"},{label:"(GMT +09:00) Seoul", value:"51"},{label:"(GMT +09:00) Yakutsk", value:"52"},{label:"(GMT +09:30) Adelaide", value:"53"},{label:"(GMT +09:30) Darwin", value:"54"},{label:"(GMT +09:00) Osaka, Sapporo, Tokyo", value:"50"}]',Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_join_audio_gui_participant",Type:"4",Value:"0",Description:"allow_join_audio_gui_participant",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_presenter_role",Type:"4",Value:"1",Description:"if 1 indicates that meeting supports presenter role notion",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_region_share",Type:"4",Value:"0",Description:"allow_region_share",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_roll_call_replay",Type:"4",Value:"0",Description:"allow_roll_call_replay",ApplyFrom:"10676",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"allow_set_notifications",Type:"4",Value:"1",Description:"allow_set_notifications",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"annotation",Type:"4",Value:"1",Description:"annotation",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"app_share_min_version",Type:"1",Value:"4.4.0.000",Description:"app_share_atlas3_min_version",ApplyFrom:"10676",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"app_share_png",Type:"4",Value:"1",Description:"app_share_png",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"app_sharing",Type:"4",Value:"1",Description:"app_sharing",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"application_debug",Type:"4",Value:"0",Description:"application_debug",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"appshare_pause_during_window_drags",Type:"4",Value:"0",Description:"appshare_pause_during_window_drags",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"archive_cd_delivery_term",Type:"2",Value:"5",Description:"archive_cd_delivery_term",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"archive_zip_term_duration",Type:"2",Value:"15",Description:"archive_zip_term_duration",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"archiving",Type:"4",Value:"1",Description:"archiving",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"archiving_pause",Type:"4",Value:"0",Description:"archiving_pause",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"archiving_web",Type:"4",Value:"0",Description:"archiving_web",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"athena_bandwidth_cap",Type:"2",Value:"2048000",Description:"athena_bandwidth_cap",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"participant_self_dialout",Type:"4",Value:"1",Description:"Enable Dial-out to  Attendee",ApplyFrom:"10676",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"participant_show_disclaimer",Type:"4",Value:"1",Description:"participant_show_disclaimer",ApplyFrom:"9932",ApplyTo:"10676",Readable:"true",Writable:"true"},{Id:"-1",Name:"zoom",Type:"4",Value:"1",Description:"zoom",ApplyFrom:"1000",ApplyTo:"10676",Readable:"true",Writable:"true"}]}})
    };
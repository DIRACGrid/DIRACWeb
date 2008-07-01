var gMainGrid = false;

function initManageProxies(){

  Ext.onReady(function(){
    renderPage();
  });
}

function renderPage()
{
	var reader = new Ext.data.JsonReader({
		root : 'proxies',
		totalProperty : 'numProxies',
		id : 'proxyid',
		fields : [ 'username', 'DN', 'group', 'expiration', 'persistent' ]
    });

	var store = new Ext.data.GroupingStore({
				reader: reader,
				url : "getProxiesList",
				autoLoad : true,
				sortInfo: { field: 'DN', direction: 'ASC' },
            groupField : 'username'
        		});

	gMainGrid = new Ext.grid.GridPanel( {
		store : store,
		view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})',
            emptyText: 'No data',
            startCollapsed : false,
        }),
		columns: [
            { id : 'check', header : '', width : 30, dataIndex: 'proxyid', renderer : function(id){return '<input id="' + id + '" type="checkbox"/>';} },
            { header: "User", width: 100, sortable: true, dataIndex: 'username'},
            { header: "DN", width: 350, sortable: true, dataIndex: 'DN'},
            { header: "Group", width: 100, sortable: true, dataIndex: 'group'},
            { header: "Expiration date", width: 150, sortable: true, dataIndex: 'expiration'},
            { header: "Persistent", width: 100, sortable: true, dataIndex: 'persistent' },
        ],
      region : 'center',
   	tbar : [
   				{ handler:function(){ toggleAll(true) }, text:'Select all', width:150, tooltip:'Click to select all rows' },
    				{ handler:function(){ toggleAll(false) }, text:'Select none', width:150, tooltip:'Click to select all rows' },
   			],
		bbar: new Ext.PagingToolbar({
					pageSize: 25,
					store: store,
					displayInfo: true,
					displayMsg: 'Displaying entries {0} - {1} of {2}',
					emptyMsg: "No entries to display",
					items:['-','Items displaying per page: ', numberItemsSelector()],
        })

		} );
	renderInMainViewport( [gMainGrid] );
}


function toggleAll( select )
{
	var chkbox = document.getElementsByTagName('input');
	for (var i = 0; i < chkbox.length; i++)
	{
		if( chkbox[i].type == 'checkbox' )
		{
			chkbox[i].checked = select;
		}
	}
}

function getSelectedCheckboxes()
{
	var items = [];
	var inputs = document.getElementsByTagName('input');
	for (var i = 0; i < inputs.length; i++)
	{
		if( inputs[i].checked )
		{
        items.push( inputs[i].id );
      }
   }
   return items;
}

function numberItemsSelector(){
	var store = new Ext.data.SimpleStore({
		fields:['number'],
		data:[[25],[50],[100],[150]]
	});
	var combo = new Ext.form.ComboBox({
		allowBlank:false,
		displayField:'number',
		editable:false,
		maxLength:3,
		maxLengthText:'The maximum value for this field is 999',
		minLength:1,
		minLengthText:'The minimum value for this field is 1',
		mode:'local',
		name:'number',
		selectOnFocus:true,
		store:store,
		triggerAction:'all',
		typeAhead:true,
		value:25,
		width:50
	});
	combo.on({
		'collapse':function() {
			var bb = gMainGrid.getBottomToolbar();
			if( bb.pageSize != combo.value )
			{
				bb.pageSize = combo.value;
				gMainGrid.store.load( { params : { start : 0, limit : bb.pageSize } } );
			}
		}
 	});
	return combo;
}

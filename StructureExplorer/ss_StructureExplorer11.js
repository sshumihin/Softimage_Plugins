// StructureExplorerPlugin
// Initial code generated by Softimage SDK Wizard
// Executed Tue Jan 3 12:48:31 UTC+0400 2012 by sshadows
// 
// 
// Tip: The wizard only exposes a small subset of the possible controls
// and layout that can be achieved on a Property Page.  To find out more
// please refer to the Object Model reference documentation for PPGLayout, PPG
// and CustomProperty
// 
// Tip: Don't be concerned about achieving the exact ordering of the parameters
// because they can easily be reordered in the second phase.
// Tip: To add a command to this plug-in, right-click in the 
// script editor and choose Tools > Add Command.

function XSILoadPlugin( in_reg )
{
	in_reg.Author = "sshadows";
	in_reg.Name = "StructureExplorerPlugin";
	in_reg.Major = 1;
	in_reg.Minor = 1;

	in_reg.RegisterProperty ("StructureExplorer");
	in_reg.RegisterMenu( siMenuTbGetPropertyID,"StructureExplorer_Menu",false,false);
	//in_reg.RegisterEvent("StructureExplorer_SelectionChange", siOnSelectionChange);

	//RegistrationInsertionPoint - do not remove this line

	return true;
}

function XSIUnloadPlugin( in_reg )
{	
	var strPluginName = in_reg.Name;
	Application.LogMessage( strPluginName + " has been unloaded.",siVerbose);
	return true;
}

/*function StructureExplorer_SelectionChange_OnEvent()
{
	Application.LogMessage( "Selection Changed!",siVerbose);
	StructureExplorer_OnInit( );
}
*/
function StructureExplorer_Define( in_ctxt )
{
	var oCustomProperty = in_ctxt.Source;
	
	oCustomProperty.AddParameter3("Components", siInt4,0,0,2, false);
	oCustomProperty.AddParameter2("ObjName",siString,"",null,null,null,null,0,siPersistable);
	oCustomProperty.AddGridParameter( "Table");
	
	return true;
}

// Tip: Use the "Refresh" option on the Property Page context menu to 
// reload your script changes and re-execute the DefineLayout callback.
function StructureExplorer_RebuildLayout()
{
	//var oLayout = in_ctxt.Source;
	var oLayout = PPG.PPGLayout;
	oLayout.Clear();
	
	oLayout.AddGroup();
	oLayout.AddItem( "ObjName", "", siControlStatic );

	oLayout.AddRow();
	var oItem = oLayout.AddItem("Components");	
	oItem.UIItems = Array("Points", 0, 
						"PointPerPolygon", 1,
						"TrianglePerPolygon", 2);
	oItem.Type = siControlCombo;
	oItem.SetAttribute(siUINoLabel, true);
    oLayout.AddButton("RefreshTable", "Refresh Table");
    oLayout.EndRow();
	oLayout.EndGroup();
	
	oLayout.AddGroup();
	oItem = oLayout.AddButton("SaveFile", "Save to File");
	oItem.SetAttribute( siUICX, 260);

	oLayout.AddRow();
	oItem = oLayout.AddButton("SelectComponent", "Select Row2Comp");
	oItem.SetAttribute( siUICX, 130);
	oItem = oLayout.AddButton("SelectRow", "Select Comp2Row");
	oItem.SetAttribute( siUICX, 130);
	oLayout.EndRow();
	oItem = oLayout.AddItem("Table");
	oItem.SetAttribute( siUIValueOnly,true);
	if(PPG.Components.Value !=0)
	{
		oItem.SetAttribute( "ReadOnlyColumns",1);
	}
	oLayout.EndGroup();
	
	return true;
}

function StructureExplorer_OnInit( )
{
	//Application.LogMessage ("StructureExplorer_OnInit called",siVerbose);
	StructureExplorer_RebuildLayout( );
	RedrawGrid();
}

function StructureExplorer_OnClosed( )
{
	//Application.LogMessage( "StructureExplorer_OnClosed called",siVerbose);
}

function StructureExplorer_Menu_Init( in_ctxt )
{	
	var oMenu = in_ctxt.Source;
	oMenu.AddCallbackItem( "ss_StructureExplorer","OnStructureExplorerMenuClicked");
	return true;
}

function OnStructureExplorerMenuClicked( in_ctxt )
{	
	var oProp = Application.ActiveSceneRoot.Properties("StructureExplorer");
	if (oProp == null || typeof(oProp) == "undefined")
	{
		//Application.LogMessage( "No instances found." );
		oProp = ActiveSceneRoot.AddProperty("StructureExplorer");
	} 
	
	InspectObj( oProp);
	return true;
}

function RedrawGrid()
{
	//Application.LogMessage( "Redraw Grid!",siVerbose);
	if (Selection.Count > 0)
	{
		var oSel = Selection.Item(0);
		if( oSel.Type != "polymsh" )
		{
			oSel = Selection.Item(0).Subcomponent.Parent3DObject;
		}
		
		if( oSel.Type == "polymsh" )
		{
			var oGrid = PPG.PPGLayout.Item("Table");
			var oGridData = PPG.Table.value;
			if(PPG.Components.Value != 0)
			{			
				oGrid.SetAttribute( "ReadOnlyColumns",1);
			}
			else
			{
				oGrid.SetAttribute( "ReadOnlyColumns",0);
			}

			PPG.ObjName.Value = "Selected: " + Selection.Item(0).Name;
			
			var oGeom = oSel.ActivePrimitive.Geometry;
			var ColumnCnt = 0;
			var RowCnt = 0;
			
			var oSubComp = PPG.Components.value;
			var newArray;
			
			ResetTable();
			
			switch(oSubComp)
			{
				case 0:
					newArray = oGeom.Points.PositionArray.toArray();
					ColumnCnt = 3;
					RowCnt = oGeom.Points.Count;
					
					oGridData.BeginEdit();
					oGridData.RowCount = RowCnt;
					oGridData.ColumnCount = ColumnCnt;
					oGridData.SetColumnLabel( 0, "X");
					oGridData.SetColumnLabel( 1, "Y");
					oGridData.SetColumnLabel( 2, "Z");

					for(var i = 0; i < oGridData.RowCount; i++)
					{
						oGridData.SetRowLAbel(  i, "Point " + i.toString());
					}					

					for(var i=0; i < RowCnt; i++)
					{
						for(var v=0; v < ColumnCnt; v++)
						{
							try
							{
								var num = newArray[i*ColumnCnt+v];
								//logmessage("%: " + num%1);
								if(Math.abs(num%1) > 0)
								{
									//LogMessage("num0: " + num);
									num  = num.toFixed(6);									
									if(Math.abs(num) < 0.000001)
									{
										num = 0;
									}
									//LogMessage("num1: " + num);
								}
								oGridData.SetCell( v, i, num ) ;
							}
							catch( e )
							{
								Logmessage( "Invalid range specified" ) ;
								return;
							}
						}
					}
					oGridData.EndEdit();

					break;
					
				case 1:
					var oPolygons = oGeom.Polygons;
					var tmp = 0;
					for(var i=0; i < oPolygons.Count; i++)
					{
						var oVerts = oPolygons(i).Vertices;
						if(oVerts.Count > tmp)
						{
							tmp = oVerts.Count;
						}
					}
					ColumnCnt = tmp;
					RowCnt = oPolygons.Count;
					//LogMessage("Count: " + tmp);
					
					oGridData.BeginEdit();
					oGridData.RowCount = RowCnt;
					oGridData.ColumnCount = ColumnCnt;
					for(var i=0; i < ColumnCnt; i++)
					{
						oGridData.SetColumnLabel( i, "Point " + i);
					}
					
					for(var i = 0; i < RowCnt; i++)
					{
						oGridData.SetRowLabel(  i, "Polygon " + i.toString());
					}					

					for(var i=0; i < oPolygons.Count; i++)
					{
						var oVerts = oPolygons(i).Vertices;
						for(var v=0; v < oVerts.Count; v++)
						{
							try
							{
								oGridData.SetCell( v, i,  oVerts(v).Index) ;
								//Logmessage( "Cell: " + i+v ) ;
							}
							catch( e )
							{
								Logmessage( "Invalid range specified" ) ;
								return;
							}
						}
						
						//Logmessage( "v: " + v ) ;						
						if(v < ColumnCnt)
						{
							for(var vv=v; vv < ColumnCnt; vv++)
							{
								try
								{
									oGridData.SetCell( vv, i,  "") ;
								}
								catch( e )
								{
									Logmessage( "Invalid range specified" ) ;
									return;
								}
							}
						}
					}
					oGridData.EndEdit();

					break;
				case 2:
					var oPolygons = oGeom.Polygons;
					var tmp = 0;
					for(var i=0; i < oPolygons.Count; i++)
					{
						var Polygon = oPolygons.Item(i);
						var NbTriangles = Polygon.NbPoints-2;
						if(NbTriangles > tmp)
						{
							tmp = NbTriangles;
						}
					}
					ColumnCnt = tmp*3;
					RowCnt = oPolygons.Count;

					oGridData.BeginEdit();
					oGridData.RowCount = RowCnt;
					oGridData.ColumnCount = ColumnCnt;
					for(var i=0; i < ColumnCnt; i+=3)
					{
						for(var p=0; p < 3; p++)
						{
							oGridData.SetColumnLabel( i+p, "Tr" + i/3 + "Pnt" + p);
						}
					}
					
					for(var i = 0; i < RowCnt; i++)
					{
						oGridData.SetRowLabel(  i, "Polygon " + i.toString());
					}					

					for(i = 0; i < oPolygons.Count; i++)
					{
						var Polygon = oPolygons.Item(i);
						var NbTriangles = Polygon.NbPoints-2;
						var PolygonVertices = Polygon.Vertices;
						var TriangleSubIndices = Polygon.TriangleSubIndexArray.toArray();
						for(j = 0; j < NbTriangles*3; j+=3)
						{
							for(p = 0; p < 3; p++)
							{
								//Application.LogMessage("SubTriangle " + j/3 + " of Polygon " + i + " correspond to vertices (" + 
								//PolygonVertices.Item(TriangleSubIndices[j+p]).Index + ")");
								
								var idx = PolygonVertices.Item(TriangleSubIndices[j+p]).Index;
								try
								{
									oGridData.SetCell( j+p, i, idx);
									//Logmessage( "Cell: " + i+v ) ;
								}
								catch( e )
								{
									Logmessage( "Invalid range specified" ) ;
									return;
								}
							}
						}
						//LogMessage("j: " + (j) + ", ColumnCnt: " + ColumnCnt);
						
						if(j < ColumnCnt)
						{
							for(var vv=j; vv < ColumnCnt; vv++)
							{
								try
								{
									oGridData.SetCell( vv, i,  "") ;
								}
								catch( e )
								{
									Logmessage( "Invalid range specified" ) ;
									return;
								}
							}
						}						
					}
					oGridData.EndEdit();
					
					break;
				default:
					newArray = oGeom.Points.PositionArray;
					break;
			}
			PPG.Refresh();
		}
		else
		{
			ResetTable();
		}
	}
	else
	{
		ResetTable();
	}
}

function StructureExplorer_RefreshTable_OnClicked()
{
	Application.LogMessage( "Click Redraw Grid!",siVerbose);
	RedrawGrid();
}

function StructureExplorer_Components_OnChanged()
{
	Application.LogMessage( "Components Changed!",siVerbose);
	RedrawGrid();
}

function StructureExplorer_Table_OnChanged()
{
	if (Selection.Count > 0)
	{
		if( Selection.Item(0).Type == "polymsh" )
		{
			var oSel = Selection.Item(0);
			var oSubComp = PPG.Components.value;
			if(oSubComp == 0)
			{
				var oGrid = PPG.Table.Value;
				var oData  = oGrid.Data;
				//Logmessage("Array: " + newArray.Data.toArray());
				try
				{
					oSel.ActivePrimitive.Geometry.Points.PositionArray = oData.toArray();
				}
				catch(e)
				{
					LogMessage("Try to Freeze your Object! " + e);
					return;
				}
			}
		}
	}
}
function ResetTable()
{
	var oGridData = PPG.Table.value;
	
	oGridData.BeginEdit();
	oGridData.RowCount = 0;
	oGridData.ColumnCount = 0;
	oGridData.EndEdit();

	PPG.Refresh();
}

function StructureExplorer_SelectComponent_OnClicked()
{
	var oGridData = PPG.Table.Value ;
	var oGridWidget = oGridData.GridWidget;
	var idx = -1;
	for ( var i= 0  ; i< oGridData.RowCount ; i++ )
	{
		if ( oGridWidget.IsRowSelected(i) )
		{
			idx = i;
			break;
		}
	}
	//LogMessage("idx: " + idx);
	
	if(idx == -1) return;
	
	var oSubComp = PPG.Components.value;
	var oName = Selection(0).Name;
	switch(oSubComp)
	{
		case 0:
			ActivateVertexSelTool(null);
			DeselectAll();
			AddToSelection( oName + ".pnt[" + idx+ "]", null, true);
			break;
		case 1:
			ActivateRaycastPolySelTool(null);
			DeselectAll();
			AddToSelection( oName + ".poly[" + idx+ "]", null, true);			
			break;
		case 2:
			ActivateRaycastPolySelTool(null);
			DeselectAll();
			AddToSelection( oName + ".poly[" + idx+ "]", null, true);
			break;
		default:
			break;
	}	
}

function StructureExplorer_SelectRow_OnClicked()
{
	var oSubComp = PPG.Components.value;
	var oGridData = PPG.Table.Value;
	var oGridWidget = oGridData.GridWidget;

	switch(oSubComp)
	{
		case 0:
			if ( Selection(0).Type == "pntSubComponent" )
			{
				var oSelSubComp = Selection(0).SubComponent.ComponentCollection;	
				oGridWidget.ClearSelection();
				oGridWidget.AddToSelection(-1, oSelSubComp(0).Index);
			}

			break;
		case 1:
			if ( Selection(0).Type == "polySubComponent" )
			{
				var oSelSubComp = Selection(0).SubComponent.ComponentCollection;	
				oGridWidget.ClearSelection();
				oGridWidget.AddToSelection(-1, oSelSubComp(0).Index);
			}
		
			break;
		default:
			break;
	}
}

function StructureExplorer_SaveFile_OnClicked()
{
	var initialDir = Application.InstallationPath(siProjectPath);
	var oUIToolkit = new ActiveXObject("XSI.UIToolKit") ;
	var oFileBrowser = oUIToolkit.FileBrowser ;
	oFileBrowser.DialogTitle = "Save a file" ;
	oFileBrowser.InitialDirectory = initialDir ;
	oFileBrowser.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*||" ;
	oFileBrowser.ShowSave() ; 
	if ( oFileBrowser.FilePathName != "" )
	{
		var fso = new ActiveXObject('Scripting.FileSystemObject');
		var tf = fso.CreateTextFile(oFileBrowser.FilePathName, true);
		var oGridData = PPG.Table.Value;
		var oComp = PPG.Components.Value;
				
		var oString = oGridData.GetRowLabel(0).split(" ")[0];
		for ( var i= 0  ; i< oGridData.ColumnCount ; i++ )
		{
			oString+= "\t" + oGridData.GetColumnLabel(i);
		}		
		
		tf.WriteLine(oString);
		
		for ( var i= 0  ; i< oGridData.RowCount ; i++ )
		{
			oString = i;
			var aSafeArray = oGridData.GetRowValues( i ) ;
			var aRead = new VBArray( aSafeArray ).toArray() ;
			for ( var p= 0  ; p< oGridData.ColumnCount ; p++ )
			{
				oString+=("\t" + aRead[p]);
			}

			tf.WriteLine(oString);
		}

		tf.Close();
	}
}
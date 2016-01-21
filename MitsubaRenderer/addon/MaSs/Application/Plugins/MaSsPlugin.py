# MaSsPlugin
# Initial code generated by Softimage SDK Wizard
# Executed Sat Mar 15 20:25:07 UTC+0600 2014 by Philipp
# 
# Tip: To add a command to this plug-in, right-click in the 
# script editor and choose Tools > Add Command.
import win32com.client
from win32com.client import constants as c
import sys

lm = Application.LogMessage

integTypes = ["Ambient occlusion", "ao", "Direct illumination", "direct", "Path tracer", "path", "Simple volumetric path tracer", "volpath_simple", "Extended volumetric path tracer", "volpath", "Bidirectional path tracer", "bdpt","Photon map", "photonmapper","Progressive photon mapping", "ppm","Stochastic progressive photon mapping", "sppm","Primary sample space metropolis light transport", "pssmlt","Path space metropolis light transport", "mlt","Energy redistribution path tracing", "erpt","Adjoint particle tracer", "ptracer","Adaptive", "adaptive","Virtual point light", "vpl","Irradiance caching", "irrcache","Multi-channel", "multichannel","Field extraction", "field"]

null = None
false = 0
true = 1
incrementValue = 1

def XSILoadPlugin( in_reg ):
	in_reg.Author = "Angel07"
	in_reg.Name = "MaSsPlugin"
	in_reg.Major = 1
	in_reg.Minor = 0

	in_reg.RegisterProperty("MaSs")
	in_reg.RegisterCommand("MaSsOpen","MaSsOpen")
	#in_reg.RegisterMenu(c.siMenuMCPEditID, "MaSs", False, True)
	#RegistrationInsertionPoint - do not remove this line
	pluginLocation = in_reg.OriginPath
	if not pluginLocation in sys.path:
		sys.path.append( pluginLocation )
	
	return true

def XSIUnloadPlugin( in_reg ):
	strPluginName = in_reg.Name
	Application.LogMessage(str(strPluginName) + str(" has been unloaded."), c.siVerbose)
	return true


def MaSsOpen_Init( in_ctxt ):
	oCmd = in_ctxt.Source
	oCmd.Description = "Opens the MaSs"
	oCmd.Tooltip = "Opens the MaSs"
	oCmd.SetFlag(c.siSupportsKeyAssignment, False)
	oCmd.SetFlag(c.siCannotBeUsedInBatch, True)

	return true

def MaSsOpen_Execute():
	Application.LogMessage("MaSs_Execute called", c.siVerbose)
	# 
	# TODO: Put your command implementation here.
	# 	
	#CreatePPG()
	oScnRoot = Application.ActiveProject2.ActiveScene.Root
	oProp = oScnRoot.AddProperty("MaSs", False, "MaSs")
	popWindow(oProp, 200, 200, 400, 400)

	return true

def MaSs_DefineLayout( in_ctxt ):
	return True

def MaSs_OnInit():
	buildUI()
	return

def MaSs_Source_OnChanged():
	buildUI()
	return
	
def MaSs_Path_OnChanged():
	buildUI()
	return

def MaSs_FileName_OnChanged():
	buildUI()
	return

def MaSs_OnClosed():
	oScnRoot = Application.ActiveProject2.ActiveScene.Root
	try:
		Application.DeleteObj(oScnRoot.Properties("MaSs"))
	except:
		log("Could not delete MaSs property.", 8)

def popWindow(prop, moveX, moveY, resizeX, resizeY):
	myView = Application.Desktop.ActiveLayout.CreateView("Property Panel", prop.Name)
	myView.BeginEdit()
	myView.Move(moveX, moveY)
	myView.Resize(resizeX, resizeY)
	myView.SetAttributeValue("targetcontent", prop.FullName)
	myView.EndEdit()

	return True
	
def GetCameraList():
	cams = Application.ActiveSceneRoot.FindChildren("*", "camera")
	
	list = []
	for cam in cams:
		list.append(cam.Name)
		list.append(cam.Name)
	return list

def MaSs_Define( in_ctxt ):
	oProp = in_ctxt.Source
	oProp.AddParameter3("Source", c.siString, "allScene", "", "", False, False)
	oProp.AddParameter3("Path", c.siString, "C:\\Downloads\\xml", "", "", False, False)
	#oProp.AddParameter3("Path", c.siString, "", "", "", False, False)
	oProp.AddParameter3("FileName", c.siString, "Scene", "", "", False, False)
	oProp.AddParameter3("ShouldIncrement", c.siBool, 0, "", "", False, False)
	oProp.AddParameter3("ShouldExportGeometry", c.siBool, 1, "", "", False, False)
	oProp.AddParameter3("ShouldExportStrands", c.siBool, 1, "", "", False, False)
	oProp.AddParameter3("Camera", c.siString, GetCameraList()[0],  "", "", False, False)
	oProp.AddParameter3("isPolymesh", c.siBool, 1, "", "", False, False)
	oProp.AddParameter3("isLight", c.siBool, 1, "", "", False, False)
	oProp.AddParameter3("isCamera", c.siBool, 1, "", "", False, False)
	oProp.AddParameter3("isPointClouds", c.siBool, 1, "", "", False, False)
	oProp.AddParameter3("Integrator", c.siString, "path", "", "", False, False)

	oProp.AddParameter3("Width", c.siInt4, 1024, 1, 16384, False, False)
	oProp.AddParameter3("Height", c.siInt4, 768, 1, 16384, False, False)

def buildUI():
	oProp = PPG.Inspected(0)
	oLayout = PPG.PPGLayout
	oLayout.Clear()

	oLayout.AddTab("Options")
	oLayout.AddGroup("File options")

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddEnumControl("Source", ["All scene", "allScene", "Selected model", "selectedModel", "Selected Objects", "selectedObjects"])
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	strSource = oProp.Parameters("Source").Value

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("Path", "", c.siControlFolder)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	strPath = oProp.Parameters("Path").Value

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("FileName", "File name", c.siControlString)
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	strFileName = oProp.Parameters("FileName").Value

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("ShouldIncrement", "Should increment")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("ShouldExportGeometry", "Should export geometry")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()
	
	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("ShouldExportStrands", "Should export strands")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	oLayout.EndGroup()

	oLayout.AddGroup("Image properties")

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("Width", "Width")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("Height", "Height")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	oLayout.EndGroup()

	oLayout.AddGroup("Camera")
	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddEnumControl("Camera", GetCameraList())
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()
	oLayout.EndGroup()

	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddButton("ExportXML", "Export XML")
	oItem.SetAttribute(c.siUICX, 380)
	oItem.SetAttribute(c.siUICY, 30)	
	oLayout.AddSpacer(10, 10)

	oLayout.AddTab("Types")
	oLayout.AddGroup("Export types")

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("isPolymesh", "Polymesh")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("isLight", "Light")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()

	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("isCamera", "Camera")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()
	
	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddItem("isPointClouds", "Point clouds")
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()
	
	oLayout.EndGroup()
	
	oLayout.AddTab("Render")
	oLayout.AddGroup("Integrator")
	
	oLayout.AddRow()
	oLayout.AddSpacer(10, 10)
	oItem = oLayout.AddEnumControl("Integrator", integTypes)
	oItem.SetAttribute(c.siUILabelMinPixels, 75)
	oItem.SetAttribute(c.siUILabelPercentage, 15)
	oLayout.AddSpacer(10, 10)
	oLayout.EndRow()	
	oLayout.EndGroup()	
	
	PPG.Refresh()

def MaSs_ExportXML_OnClicked():
	StartCppExport()
	#StartPythonExport()

def StartCppExport():
	oProp = PPG.Inspected(0)
	strIsInc = oProp.Parameters("ShouldIncrement").Value
	
	global incrementValue
	if(strIsInc):		
		incrementValue += 1
	else:
		incrementValue = -1
	
	Application.MaSsExport(incrementValue)
	
def StartPythonExport():
	oProp = PPG.Inspected(0)
	strIsInc = oProp.Parameters("ShouldIncrement").Value
	strFileName = oProp.Parameters("FileName").Value
	strSource = oProp.Parameters("Source").Value
	strPath = oProp.Parameters("Path").Value
	strIsInc = oProp.Parameters("ShouldIncrement").Value
	
	strFileName += "Python"

	global incrementValue

	strCompleteFilePath = strPath
	if strPath == "":
		Application.LogMessage("Select export path!")
	else:
		if strIsInc == True:
			strCompleteFilePath = strCompleteFilePath + "\\" + strFileName + str(incrementValue) + ".xml"
			incrementValue = incrementValue + 1
		else:
			strCompleteFilePath = strCompleteFilePath + "\\" + strFileName + ".xml"
		import MaSsXML
		reload(MaSsXML)
		
		
		file = open(strCompleteFilePath, "w")
		
		file.write(MaSsXML.GenerateXMLScene(bool(oProp.Parameters("isPolymesh").Value), bool(oProp.Parameters("isLight").Value), bool(oProp.Parameters("isCamera").Value), int(oProp.Parameters("Width").Value), int(oProp.Parameters("Height").Value), str(oProp.Parameters("Camera").Value), bool(oProp.Parameters("ShouldExportGeometry").Value), bool(oProp.Parameters("isPointClouds").Value), bool(oProp.Parameters("ShouldExportStrands").Value), strPath, strSource, str(oProp.Parameters("Integrator").Value)))
		file.close()
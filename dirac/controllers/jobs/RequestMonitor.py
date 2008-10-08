import logging
from time import time, gmtime, strftime

from DIRAC.Core.Utilities import Time

from dirac.lib.base import *
from dirac.lib.diset import getRPCClient
from dirac.lib.credentials import authorizeAction
from dirac.lib.sessionManager import *
from DIRAC import gLogger

log = logging.getLogger(__name__)

numberOfJobs = 25
pageNumber = 0
globalSort = []
globalSort = [["RequestID","DESC"]]

class RequestmonitorController(BaseController):
################################################################################
  def display(self):
    return render("jobs/RequestMonitor.mako")
################################################################################
  @jsonify
  def submit(self):
    RPC = getRPCClient("RequestManagement/centralURL")
    result = self.__request()
    gLogger.info("Res:",result)
    gLogger.info("Sort:",globalSort)
    gLogger.info("Page:",pageNumber)
    gLogger.info("NOJ:",numberOfJobs)
    result = RPC.getRequestSummaryWeb(result,globalSort,pageNumber,numberOfJobs)
    gLogger.info("- REQUEST:",result)
    if result["OK"]:
      result = result["Value"]
      if result.has_key("ParameterNames") and result.has_key("Records"):
        if len(result["ParameterNames"]) > 0:
          if len(result["Records"]) > 0:
            c.result = []
            jobs = result["Records"]
            head = result["ParameterNames"]
            headLength = len(head)
            for i in jobs:
              tmp = {}
              for j in range(0,headLength):
                tmp[head[j]] = i[j]
              c.result.append(tmp)
            gLogger.info("---",len(c.result))
            total = result["TotalRecords"]
            c.result = {"success":"true","result":c.result,"total":total}
          else:
            c.result = {"success":"false","result":"","error":"There are no data to display"}
        else:
          c.result = {"success":"false","result":"","error":"ParameterNames field is missing"}
      else:
        c.result = {"success":"false","result":"","error":"Data structure is corrupted"}
    else:
      c.result = {"success":"false","error":result["Message"]}
    gLogger.info("\033[0;31mRESULT:\033[0m %s" % result["ParameterNames"])
    return c.result
################################################################################
  def __request(self):
    req = {}
    global pageNumber
    if request.params.has_key("id") and len(request.params["id"]) > 0:
      pageNumber = 0
      req["JobID"] = str(request.params["id"])
    elif request.params.has_key("reqId") and len(request.params["reqId"]) > 0:
      pageNumber = 0
      req["RequestID"] = str(request.params["reqId"])
    else:
      global numberOfJobs
      global globalSort
      if request.params.has_key("limit") and len(request.params["limit"]) > 0:
        numberOfJobs = int(request.params["limit"])
      else:
        numberOfJobs = 25
      if request.params.has_key("start") and len(request.params["start"]) > 0:
        pageNumber = int(request.params["start"])
      else:
        pageNumber = 0
      if request.params.has_key("sort") and len(request.params["sort"]) > 0:
        globalSort = str(request.params["sort"])
        key,value = globalSort.split(" ")
        globalSort = [[str(key),str(value)]]
      else:
        globalSort = [["RequestID","DESC"]]
    gLogger.info("REQUEST:",req)
    return req
(function() {
  'use strict';
  var myConnector = tableau.makeConnector();
  var idMax =  0;
  myConnector.init = function(initCallback) {
        //tableau.authType = tableau.authTypeEnum.basic;
        initCallback();
    }
  // This function toggles the label shown depending
  // on whether or not the user has been authenticated
  function updateUIWithAuthState(hasAuth) {
      if (hasAuth) {
          $(".notsignedin").css('display', 'none');
          $(".signedin").css('display', 'block');
      } else {
          $(".notsignedin").css('display', 'block');
          $(".signedin").css('display', 'none');
          console.log('hello');
          //window.location.href = "/requesttoken";
      }
  }

  function getExpenses()
  {
    console.log('Hi Im inside the getdata-block');
    //var dataToReturn = [];
    var tableData = [];
    var numberOfPages = 1;
    var id =1;

    //
    tableData = getDataFromDesk(tableData,numberOfPages,id);
    tableData= (getDataFromDesk(tableData,1,idMax));

      //
    return tableData;
  }
  function getDataFromDesk(tableData,numberOfPages,id){
    for(var i = 1; i <= numberOfPages; i++)
    {
    var xhr = $.ajax({
            url: "http://localhost:3333/callapi",
            type: "GET",
            dataType: 'json',
            async: false,
            data: {
              passThroughUrl: "/api/v2/cases/search?per_page=100&since_id="+id+"&page="+i
            },
            success: function (data) {

              //console.log(data);

              var entries = data._embedded.entries;
              var lastHref = data._links.last.href;
              var indexPage = lastHref.indexOf('page=');
              var totalPages = lastHref.substring(indexPage+5,indexPage+10);
              var page= totalPages.replace(/[^0-9]/g,'');
              numberOfPages = totalPages.replace(/[^0-9]/g,'');
              if (numberOfPages > 500){
                numberOfPages = 500;
              }

              for (var i = 0;  i < entries.length; i++)
              {
                   tableData.push({
                     "id": entries[i].id,
                     "priority": entries[i].priority,
                     "description": entries[i].blurb,
                     "created_at": entries[i].created_at,
                     "opened_at": entries[i].opened_at,
                     "recieved_at": entries[i].recieved_at,
                     "resolved_at": entries[i].resolved_at,
                     "first_opened_at": entries[i].first_opened_at,
                     "category": entries[i].status,
                     "user_id": entries[i].custom_fields.user_id,
                     "label_ids": entries[i].label_ids[0],
                     "labels": entries[i].labels[0],
                     "subject": entries[i].subject,
                     "type": entries[i].type,
                     "feedback": entries[i]._links.feedbacks
              //         "status": entries[i].statuses
                  });
              idMax = entries[i].id;
              }
              // if (page == 500){
              //   tableData= tableData.concat(getDataFromDesk(tableData,1,idMax));
              // }


            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error getting tags from flickr.");
            }
        });
  }
  return tableData;
}
  function getEnterpriseUsers()
  {
    console.log('Hi Im inside the getdata-block');
    //var dataToReturn = [];
    var tableData = [];
    var xhr = $.ajax({
            url: "http://localhost:3333/callapi",
            type: "GET",
            dataType: 'json',
            async: false,
            data: {
              passThroughUrl: "/api/v2/cases/search?since_id="
            },
            success: function (data) {

              console.log(data);

              var entries = data._embedded.entries;
              for (var i = 0;  i < entries.length; i++)
              {
                   tableData.push({
                       "id": entries[i].id,
                       "priority": entries[i].priority,
                       "description": entries[i].blurb,
                       "created_at": entries[i].created_at,
                       "opened_at": entries[i].opened_at,
                       "recieved_at": entries[i].recieved_at,
                       "resolved_at": entries[i].resolved_at,
                       "first_opened_at": entries[i].first_opened_at,
                       "category": entries[i].status,
                       "user_id": entries[i].custom_fields.user_id,
                       "label_ids": entries[i].label_ids,
                       "labels": entries[i].labels,
                       "subject": entries[i].subject,
                       "type": entries[i].type,
                       "feedback": entries[i]._links.feedbacks,

              //         "status": entries[i].statuses
                  });
              }

            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error getting tags from flickr.");
            }
        });
    return tableData;
  }

  //------------- Tableau WDC code -------------//
  // Create tableau connector, should be called first

  // Init function for connector, called during every phase but
  // only called when running inside the simulator or tableau
  // myConnector.init = function(initCallback) {
  //   console.log("Hi I'm inside initcallback");
  //     tableau.authType = tableau.authTypeEnum.custom;
  //
  //     console.log("init");
  //
  //     var accessToken = Cookies.get("accessToken");
  //     console.log("Access token is '" + accessToken + "'");
  //     var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;
  //     updateUIWithAuthState(hasAuth);
  //
  //     initCallback();
  //
  //     // If we are not in the data gathering phase, we want to store the token
  //     // This allows us to access the token in the data gathering phase
  //     if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
  //         if (hasAuth) {
  //             tableau.log("Already have access token, we are good to go");
  //             var token = {
  //                     public: accessToken,
  //                     secret: Cookies.get("accessTokenSecret"),
  //                 };
  //             tableau.username = decodeURIComponent(accessToken.user_nsid);
  //             tableau.password = JSON.stringify(token);
  //
  //             if (tableau.phase == tableau.phaseEnum.authPhase) {
  //               // Auto-submit here if we are in the auth phase
  //               tableau.submit()
  //             }
  //         }
  //         else
  //         {
  //            window.location.href = "/requesttoken";
  //         }
  //     }
  // };

  // Declare the data to Tableau that we are returning from Splitwise
  myConnector.getSchema = function(schemaCallback) {

      console.log("Getting schema!");
      // var cols = [{
      //             id: "id",
      //             dataType: tableau.dataTypeEnum.string
      //         }, {
      //             id: "status",
      //             alias: "caseStatus",
      //             dataType: tableau.dataTypeEnum.string
      //         }];
      //
      //         var tableSchema = {
      //             id: "DeskStatus",
      //             alias: "Status of the tickets opened",
      //             columns: cols
      //         };
      //
      //         schemaCallback([tableSchema]);
      var expenses = [
        { id : "id", alias : "id", dataType : tableau.dataTypeEnum.int },
        { id : "priority", alias : "ticketPriority", dataType : tableau.dataTypeEnum.int },
        { id : "description", alias : "description", dataType : tableau.dataTypeEnum.string },
        { id : "created_at", alias : "created_at", dataType : tableau.dataTypeEnum.date },
        { id : "opened_at", alias : "opened_at", dataType : tableau.dataTypeEnum.date },
        { id : "recieved_at", alias : "recieved_at", dataType : tableau.dataTypeEnum.date },
        { id : "resolved_at", alias : "resolved_at", dataType : tableau.dataTypeEnum.date },
        { id : "category", alias : "category", dataType : tableau.dataTypeEnum.string },
        { id : "first_opened_at", alias : "first_opened_at", dataType : tableau.dataTypeEnum.date },
        { id : "user_id", alias : "user_id", dataType : tableau.dataTypeEnum.int },
        { id : "label_ids", alias : "label_ids", dataType : tableau.dataTypeEnum.string },
        { id : "labels", alias : "labels", dataType : tableau.dataTypeEnum.string },
        { id : "subject", alias : "subject", dataType : tableau.dataTypeEnum.string },
        { id : "type", alias : "type", dataType : tableau.dataTypeEnum.string },
        { id : "feedback", alias : "feedbacks", dataType : tableau.dataTypeEnum.string },
      ];

      var groups = [
        { id : "groupid", alias : "groupid", dataType : tableau.dataTypeEnum.int },
        { id : "group_name", alias : "group_name", dataType : tableau.dataTypeEnum.string },
      ];

      var expensesTableInfo = {
        id: "DeskStatus",
        columns: expenses
      };

      var groupsTableInfo = {
        id: "DeskGroup",
        columns: groups
      };

      //schema.push(tableInfo);

      schemaCallback([expensesTableInfo, groupsTableInfo]);
  };

  // This function calls reroutes the api calls based on which table
  // needs a refresh and passes the results back to Tableau
  myConnector.getData = function(table, doneCallback) {

      var data;
      if(table.tableInfo.id == "DeskStatus")
      {
        data = getExpenses();
      }

      table.appendRows(data);
      doneCallback();
  };

  // Register the tableau connector, call this last
  tableau.registerConnector(myConnector);

  // Confirm whether the user is connected
  // Show button to get data
  $(document).ready(function() {
      console.log("Hoo");
      var accessToken = Cookies.get("accessToken");
      var hasAuth = accessToken && accessToken.length > 0;
      updateUIWithAuthState(hasAuth);

      $("#submitButton").click(function() {
          console.log("button clicked");
          tableau.connectionName = "DeskData";
          tableau.submit();
      });
  });
})();

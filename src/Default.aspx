<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.requestexecutor.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.taxonomy.js"></script>

    <!-- Add your CSS styles to the following file -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" />
    <link href="css/jquery.dataTables.min.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet" />
    <link href="common/directives/spinner/loading-spinner.css" rel="stylesheet" />
    <link href="css/angular-growl.min.css" rel="stylesheet" />
    <link href="css/angular-datatables.min.css" rel="stylesheet" />
    <link href="css/chat.css" rel="stylesheet" />
    <link href="css/App.css" rel="Stylesheet" />
    <link href="common/people-picker/sp-peoplepicker.min.css" rel="stylesheet" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    <script type="text/javascript" src="common/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="https://code.angularjs.org/1.4.12/angular.js"></script>
    <script type="text/javascript" src="common/angular-datatables.min.js"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-route.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery.SPServices/2014.02/jquery.SPServices.min.js"></script>
    <script type="text/javascript" src="common/directives/pagination/dirPagination.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/2.5.0/ui-bootstrap-tpls.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.8/angular-animate.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.8/angular-sanitize.min.js"></script>
    
    <script type="text/javascript" src="common/directives/ui-bootstrap-dialogs.js"></script>
    <script type="text/javascript" src="common/utilities/sp-ng-module.js"></script>
    <script type="text/javascript" src="common/directives/spinner/loading-spinner.js"></script>
    <script type="text/javascript" src="common/utilities/utilities.js"></script>

    <!--Services-->
    <script type="text/javascript" src="common/services/contracts.js"></script>
    <script type="text/javascript" src="common/services/costcenters.js"></script>
    <script type="text/javascript" src="common/services/departments.js"></script>
    <script type="text/javascript" src="common/services/documenttypes.js"></script>
    <script type="text/javascript" src="common/services/currencies.js"></script>
    <script type="text/javascript" src="common/services/contract-suppliers.js"></script>
    <script type="text/javascript" src="common/services/contract-documents.js"></script>
    <script type="text/javascript" src="common/services/contract-renewals.js"></script>
    <script type="text/javascript" src="common/services/links.js"></script>
    <script type="text/javascript" src="common/services/settings.js"></script>

    <!--Directives-->
    <script type="text/javascript" src="common/directives/ng-file-model.js"></script>
    <script type="text/javascript" src="common/directives/admin-menu/admin-menu.dir.js"></script>
    <script type="text/javascript" src="common/directives/angular-growl.min.js"></script>
    <script type="text/javascript" src="common/directives/add-btn/add-btn.dir.js"></script>
    <script type="text/javascript" src="common/directives/back-btn/back-btn.dir.js"></script>
    <script type="text/javascript" src="common/people-picker/sp-peoplepicker.min.js"></script>
    <script type="text/javascript" src="common/directives/contract-details/contract-details.dir.js"></script>
    <script type="text/javascript" src="common/directives/add-document/add-document.dir.js"></script>
    <script type="text/javascript" src="common/directives/add-supplier/add-supplier.dir.js"></script>
    <script type="text/javascript" src="common/directives/links/links.js"></script>

    <!--Controllers-->
    <script type="text/javascript" src="app/adm-costcenters/costcenters.js"></script>
    <script type="text/javascript" src="app/adm-departments/departments.js"></script>
    <script type="text/javascript" src="app/adm-doctypes/doctypes.js"></script>
    <script type="text/javascript" src="app/adm-currencies/currencies.js"></script>
    <script type="text/javascript" src="app/contract-dates/contract-dates-add.js"></script>
    <script type="text/javascript" src="app/adm-settings/settings.js"></script>
    <script type="text/javascript" src="app/adm-links/links.js"></script>
    <script type="text/javascript" src="app/contracts-db/contracts-db.js"></script>


    <script type="text/javascript" src="app/App.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <div class="container-fluid">
        <div class="row">
            <div id="body" ng-app="app">
                <div class="row">
                    <div class="col-md-12">
                        <%--<div id="notification-area"></div>--%>
                        <div growl class="font-bold"></div>
                        <div class="panel panel-warning">
                            <div class="panel-heading pnl-heading">
                                <span>VSO Contracts Register</span>
                                <span class="pull-right" style="color: red;">NB: Information on the Contract Register is confidential and should not be shared outside of VSO.
                                </span>
                            </div>
                            <div class="panel-body" style="min-height: 525px;" ng-view autoscroll></div>
                            <div class="panel-footer clearfix">
                                <span class="pull-right" id="copyrightinfo">© 2024 VSO International, Global Procurement Team
                                </span>
                            </div>
                            <sarsha-spinner name="spinner1"></sarsha-spinner>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>

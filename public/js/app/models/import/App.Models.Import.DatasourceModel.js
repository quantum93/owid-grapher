;( function() {
		
	"use strict";

	App.Models.Import.DatasourceModel = Backbone.Model.extend( {
		
		urlRoot: Global.rootUrl + "/datasource/",
		defaults: { "name": "", "link": "", "description": "" },

		import: function() {

			//strip id, so that backbone uses store 
			this.set( "id", null );

			this.url = this.urlRoot + 'import';

			this.save();

		}

	} );

})();
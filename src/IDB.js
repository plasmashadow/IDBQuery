
window.tables=[];

function Property(name,type)
{
	this.name=name;
	this.type=type;
	this.complement=false;
	this.isAuto=false;
	this.values=[];
}
Property.prototype={
	put:function(value)
	{
		try
		{
		if(this.type==typeof value)
		{
			this.values.push(value)
		}
		else
		{
			throw value;
		}
	    }
	    catch(e)
     	{
     		console.log("Prototype Mismatch "+e);
     	}
	},
	setKey:function(bool)
	{
		if(bool)
		{
			//console.log("setting complement");
			this.isAuto=true;
			this.complement=true;
		}
		else
		{
			this.complement=true;
		}
	},
	get:function(number)
	{
		return this.values[number];
	},
	toString:function()
	{
		console.log(this.name+"  "+this.type+" "+this.values);
	}
}


function Table(name)
{
	this.name=name;
	this.properties=[];
	this.foreignKeys=[];
}

Table.prototype={
    add:function(property)
    {
    	this.properties.push(property);
    },
    getPrimaryKey:function()
    {
       for(var i=0;i<this.properties.length;i++)
       {
       	  if(this.properties[i].complement)
       	  {
       	  	return this.properties[i];
       	  }
       }
    },
    addRelation:function(table)
    {
    	this.foreignKeys.push(table);
    	// this.properties.push(table.getPrimaryKey());
    	try
    	{
    	if(table.getPrimaryKey())
    	{
    		this.properties.push(table.getPrimaryKey());
    	}
    	else
    	{
    		throw table;
    	}
        }
        catch(e)
        {
        	console.log("The table doesn't have a primary key",e.name);
        }
    },
    toString:function()
    {
    	console.log(this.name+" "+this.properties+" "+this.foreignKeys);
    }
}


/*
JSON data to convert table to schema
{
	name:"user",
	properties:
	[
	{name:"person",type:"string"},
	{name:"age",type:"number"},
	{name:"person_id",type:"number",auto:true,key:true}
	]
	foreignKeys:[
	{
		name:"tablename"
	}]
}
*/
function Schema(data)
{
	var self=this;
    self.data=data;

    (function validate(data)
    {
    	try
    	{
    		/*
    		parsing the table name
    		*/
    		var pkeycount=0;
    		if(self.data.name)
    		{
    			self.tablename=self.data.name;
    		}
    		else
    		{
    			self.tablename="SchemaUndefined";
    		}
    		self.tabel=new Table(self.tablename);

    		/*
    		 *parsing properties
    		 */
    		 if(self.data.properties)
    		 {
    		 	self.data.properties.forEach(function(property){
    		 		var p=new Property(property.name,property.type);
    		 		if(p.type==undefined)
    		 		{
    		 			throw p;
    		 		}
    		 		if(property.key && property.auto)
    		 		{
    		 			p.setKey(true);
    		 			pkeycount++;
    		 		}
    		 		else
    		 		{
    		 			if(property.key)
    		 			{
    		 				p.setKey(false);
    		 				pkeycount++;
    		 			}
    		 		}
    		 		self.tabel.add(p);
    		 		if(pkeycount<=1)
    		 		{
    		 			p.code=001;
    		 			//throw p;
    		 		}
    		 	});
    		 }
    		 /*
    		 *parsing foreign keys
    		 */
    		 if(self.data.foreignKeys)
    		 {
    		 	window.tables.forEach(function(table){
    		 		self.data.foreignKeys.forEach(function(key){
    		 			if(key.name===table.name)
    		 			{
    		 				self.tabel.addRelation(table);
    		 			}
    		 		});
    		 	});
    		 }
    	}
    	catch(e)
    	{
    		switch(e.code)
    		{
    			case 1:
    			    console.log("Table cannot have more than one primary key");
    			    return;
    			    break;
    		}
    		console.log(e);
    	}
    	return true;
    })(self.data);
    window.tables.push(self.tabel);
    console.log(self.tabel);

}

var dump={
	name:"person",
	properties:[
	{name:"person_id",type:"number",key:true}
	]
}
var sce=new Schema(dump);

var data=
{
	name:"user",
	properties:
	[
	{name:"username",type:"string"},
	{name:"age",type:"number"},
	{name:"user_id",type:"number",auto:true,key:true}
	],
	foreignKeys:[
       {name:"person"}
	]
};

var scheme=new Schema(data);



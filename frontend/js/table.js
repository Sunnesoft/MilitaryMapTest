function extend(Child, Parent) {
    var F = function() { }
    F.prototype = Parent.prototype
    Child.prototype = new F()
    Child.prototype.constructor = Child
    Child.superclass = Parent.prototype
}

function Table(set)
{
    this.init(set,{
      '$primary' : "",
      '$autoinc' : "",
      '$scheme' : null,
      '$length' : 0,
      '$inc'    : 0,
      '$table' : {}
    });
};

Table.prototype.init = function(set,def)
{
    (function(p,def,$T){
        $.extend(true,$T,def,p);
    })(set||{},def||{},this);
}

Table.prototype.add = function(row)
{
	var key = this.$inc,
		obj = {},
		notempty = 0;

	if(this.$primary == this.$autoinc && this.$autoinc.length)
	{	
		if(row.hasOwnProperty(this.$primary))
		{
			key = row[this.$primary];

            if(this.$table.hasOwnProperty(key))
			{
                obj = this.$table[key];
            }
            else
            {
                if(parseInt(key)>this.$inc)
                {
                    this.$inc = key;
                }
            }
		}
		else
		{
			row[this.$autoinc] = this.$inc;
		}	
	}
	else if(this.$primary != this.$autoinc)
	{
		if(this.$autoinc.length)
		{
			row[this.$autoinc] = this.$inc;
		}		

		if(this.$primary.length && !row.hasOwnProperty(this.$primary))
		{
			return -1;
		}	
        else if(this.$primary.length && row.hasOwnProperty(this.$primary))
        {
            key = row[this.$primary];
        }
        else if(!this.$primary.length)
        {
            return -1;
        }
	}

	for(var i in this.$scheme)
	{
		if(row.hasOwnProperty(this.$scheme[i]))
		{
            obj[this.$scheme[i]] = row[this.$scheme[i]];
			++notempty;
		}
        else
        {
            if(!this.$table.hasOwnProperty(key))
            {
               obj[this.$scheme[i]] = null;
            }
        }
	}

	if(notempty)
	{		
        if(!this.$table.hasOwnProperty(key))
        {
            ++(this.$length);
            ++(this.$inc);
        }
        this.$table[key] = obj;
		return key;
	}

	return -1;
};

Table.prototype.remove = function(rowid)
{
	if(this.$table.hasOwnProperty(rowid))
	{
		delete this.$table[rowid];
		--(this.$length);
	}
};

Table.prototype.clear = function()
{
	for(var i in this.$table)
	{
		this.remove(i);
	}

	this.$inc = 0;
};

Table.prototype.fill = function(table)
{
    this.clear();

    for(var i in table)
    {
        if(table.hasOwnProperty(i))
        {
            this.add(table[i]);
        }
    }
};

Table.prototype.getByPrimary = function(val)
{
    if(!this.$primary.length)
    {
        return {};
    }

    for(var i in this.$table)
    {
        if(!this.$table.hasOwnProperty(i))
        {
            continue;
        }

        if(this.$table[i][this.$primary] == val)
        {
            return this.$table[i];
        }
    }

    return {};
};

function PositionTable(set)
{
    this.init(set,{
        '$primary' : "",
        '$autoinc' : "",
        '$scheme' : null,
        '$length' : 0,
        '$inc'    : 0,
        '$table' : {},
    });
}

extend(PositionTable,Table);

PositionTable.prototype.getByPos = function(pos)
{
    var obj = {};
    var length = 0;

	for(var i in this.$table)
	{
		if(this.$table.hasOwnProperty(i))
		{
            if(this.$table[i].pos_x == pos.x &&
               this.$table[i].pos_y == pos.y)
            {
                obj[i] = this.$table[i];
                ++length;
            }
		}		
	}

    return [length,obj];
};

function TargetTable()
{
    this.init({
        '$scheme':['id','stage_id','element_id','end_x','end_y','pos_x','pos_y','description'],
        '$primary':'id',
        '$autoinc':'id',
        '$length' : 0,
        '$inc'    : 0,
        '$table' : {},
    });
}


extend(TargetTable,PositionTable);

TargetTable.prototype.joinWithElement = function(tb)
{
    var nt = new TargetTable();
    nt.fill(this.$table);
    nt.$scheme.push('title');
    nt.$scheme.push('bg');
    nt.$scheme.push('raderr');
    nt.$scheme.push('type');

    for(var i in this.$table)
    {
        var e = tb.getByPrimary(this.$table[i].element_id);
        if(!e.hasOwnProperty("id"))
        {
            continue;
        }

        var tmp = {};
        $.extend(tmp,e);
        tmp.id = this.$table[i].id;

        nt.add(tmp);
    }

    return nt;
};

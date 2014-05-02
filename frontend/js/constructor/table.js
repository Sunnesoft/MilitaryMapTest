function Table(config)
{
	if(!config.scheme)
	{
		throw 'Please setup table\'s scheme!';
	}

	this.scheme = config.scheme;
	this.primary = config.primary;

	this.data = [];
}

Table.prototype.clear = function()
{
	this.data.length = 0;
}

Table.prototype.insert = function(row)
{
	if(!row || (this.primary && !row[this.primary]))
	{
		throw 'incorrect row';
	}

	if(this.primary && this.getRowByPrimary(row[this.primary]))
	{
		throw 'dublicate row!';
	}

	var data = {};

	for(var i in this.scheme)
	{
		if(this.scheme.hasOwnProperty(i) && row.hasOwnProperty(this.scheme[i]))
		{
			data[this.scheme[i]] = row[this.scheme[i]];
			continue;
		}

		data[this.scheme[i]] = null;
	}

	this.data.push(data);
}

Table.prototype.remove = function(rowid)
{
	this.data.splice(rowid,1);
}

Table.prototype.update = function(rowid,row)
{
	if(!this.data.hasOwnProperty(rowid))
	{
		this.insert(row);
		return;
	}

	for(var i in this.scheme)
	{
		if(this.scheme.hasOwnProperty(i) && 
			row.hasOwnProperty(this.scheme[i]) && 
			this.scheme[i] != this.primary)
		{
			this.data[rowid][this.scheme[i]] = row[this.scheme[i]];
		}
	}
}

Table.prototype.getRowByPrimary = function(p)
{
	var i = this.getRowId(p);
	if(i)
	{
		return this.data[i];
	}

	return null;
}

Table.prototype.getRowId = function(primary)
{
	if(!this.primary)
	{
		throw 'primary key isn\'t defined';
	}	

	for(var i in this.data)
	{
		if(this.data[i][this.primary] == primary)
		{
			return i;
		}
	}

	return null;
}

Table.prototype.getLastRowId = function()
{
	return this.data.length - 1;
}
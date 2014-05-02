import 	std.string, 
		std.conv, 
		std.stdio, 
		std.file, 
		std.range, 
		std.regex,
		std.path,
		std.algorithm,
		std.process;

struct Package
{
	string[string] value;
};

class PackageWriter{
private:
	string _srcFn;
	string _exeFn;
	string _objFn;

public:
	this(string fn)
	{
		setFn(fn);
	}

	void setFn(string fn)
	{
		_srcFn = fn;
		_exeFn = stripExtension(fn)~".exe";
		_objFn = stripExtension(fn)~".obj";		
	}

	@property string srcFn()
	{
		return _srcFn;
	}

	@property string exeFn()
	{
		return _exeFn;
	}

	@property string objFn()
	{
		return _objFn;
	}

	void writeSource(string source)
	{
		std.file.write(this.srcFn,source);
	}

	void compile(string logFileName)
	{
		auto logFile = File(logFileName, "a");

		auto dmdPid = spawnProcess(["dmd", "-O", "-release", "-inline", this.srcFn ],
			std.stdio.stdin,
			std.stdio.stdout,
			logFile
		);

		if (wait(dmdPid) != 0)
		{
			clear();
			throw new Exception("Compilation "~this.srcFn~" failed!");
		}
	}

	void exec()
	{
		auto creatorPid = spawnProcess(this.exeFn);
		if (wait(creatorPid) != 0)
		{
			clear();
			throw new Exception("Execution "~this.exeFn~" failed!");
		}
	}

	void clear()
	{
		if(exists(this.srcFn))
		{
			remove(this.srcFn);
		}

		if(exists(this.exeFn))
		{
			remove(this.exeFn);
		}

		if(exists(this.objFn))
		{
			remove(this.objFn);
		}
	}
};

int main(string[] args) 
{
	
	auto a = args[1..$];

	if(a.length == 0)
	{
		writeln("Incorrect arguments count.");
		return 1;
	}

	auto cfg = a[0];

	if(!exists(cfg))
	{
		writeln("Incorrect config filepath.");
		return 1;
	}

	auto file = File(cfg); // Open for reading
	auto range = file.byLine();

	Package[] pack;
	Package cur;

	foreach (line; range)
	{
		line = strip(line);

	    if (line.empty || line[0] == '#')
	    {
	    	continue;
	    }
	    
	    auto insec = match(line, regex(`\[package\]`));

	    if(!insec.captures.empty)
	    {
	    	pack ~= cur;

	    	cur.clear();
	    	continue;
	    }

	    insec = match(line, regex(`(?P<var>[\w\d_]{1,})\s*=\s*(?P<value>[\*"'\[\]\w\d_\\/:\.\{\},]{1,})`));

	    if(!insec.captures.empty)
	    {
	    	cur.value[to!string(insec.captures["var"])] = to!string(insec.captures["value"]); 
	    }
	}

	pack ~= cur;

	auto sstr = "q\"[ ";
	auto send = " ]\"";

	foreach(ref p; pack)
	{	
		if(p.value.length == 0)
		{
			continue;
		}

		auto name 	= p.value["name"].replace("\"","");
		auto inpath = p.value["inputPath"].replace("\"","");
		auto files 	= p.value["files"].replace("\"","");
		auto imp 	= p.value.get("importLibs","").replace("\"","");

		writefln("processing package %s:%s",name,files);

		if(!exists(inpath))
		{
			writefln("%s:%s - directory is invalid",name,inpath);
			continue;
		}

		auto pfiles = dirEntries(
			inpath,
			files,
			SpanMode.depth
		);

		auto source = "import std.string, std.file, std.path"~(imp.empty?";":", "~imp~";");
		auto vars = "";

		foreach(key,val; p.value)
		{
			vars~="\tauto "~key~" = "~val~";\n";
		}

		auto calls = "";

		int i = 0;

		foreach(d; pfiles)
		{
			writefln("processing file %s ...",d.name);

			auto text = readText(d.name);
			auto ofname = std.array.split(d.name,inpath)[1].replace("\\","/");
			auto docname = "Document"~to!string(i);

			source ~= "\nclass "~docname~"{\n";
			source ~= "private:\n"~vars;

			int j = 0;

			text = sstr~std.regex.replaceAll!(delegate(Captures!(string) m){

				auto fun = m.captures[2].replace(m.captures[1],"").replace(m.captures[3],"");
				auto fname = "j"~to!string(j)~"()";

				source ~= "\nstring "~fname~"{\nstring output = \"\";\n";
				source ~= fun;
				source ~= "\nreturn output;\n}\n";

				j++;

				return send~"~"~fname~"~"~sstr;
			})(text,regex(`(?=(dmd\s*\{))\s*([\s\S]*?)\s*(?<=(\}\s*dmd))`)) ~ send;

			source ~= q"[
				public:

				void compile()
				{
					string source = ]" ~text~q"[;
					string ofname = outputPath~"]" ~ofname~q"[";
					string ofpath = relativePath(ofname);

					if(!exists(ofpath))
					{
						mkdirRecurse(ofpath);
					}	

					std.file.write(ofname,source);				
				}
				};
			]";

			calls ~= "\n\t\tauto v"~docname~" = new "~docname~";\n\t\tv"~docname~".compile();";

			i++;
			
		} 

		source ~= "int main(string[] args){\n" ~ calls ~"\nreturn 0;\n}\n";
		
		auto pwriter = new PackageWriter("./"~name~"_temp.d");
		try
		{
			pwriter.writeSource(source);
			pwriter.compile("errors.log");
			pwriter.exec();
			pwriter.clear();				
		}
		catch(Exception e)
		{
			writeln(e);
		}	    
	}

	return 0;
}
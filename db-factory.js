
// dbSelect( dbFactory.executeSelectSql
// dbTrans.commit( dbFactory.transactionCommit
// dbTrans.begin(	dbFactory.transactionBegin
// dbTrans.rollback( dbFactory.transactionRollback
// dbUpdate( dbFactory.updateDb
// dbUpdateAdd(  dbFactory.updateDbAdd
// dbDelete(	dbFactory.deleteDb
// dbReplace(	dbFactory.updateOrInsertIntoDb
// dbInsertMulti( dbFactory.insertIntoDbMulti
// dbExec(	dbFactory.executeSql

// dbReplaceInto(	dbFactory.replaceIntoDb
// dbReplaceIntoByTb( dbFactory.replaceIntoDb
(function(definition) {
	"use strict";
    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition; 
        }

    // <script>
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== "undefined" ? window : self;
		// Get the `window` object, save the previous DBFactory global
        // and initialize DBFactory as a global.
        global.DBFactory = definition();
    } else {
        throw new Error("This environment was not anticipated by db-factory!");
    }
})(function(){
	var q = require("q");

/////////////////////////////////
///主机数据库操作对象
	var DBFactory = function(){};
	DBFactory.prototype.dbInstance = {db:null, isOpen:false, isClose:false};
	DBFactory.prototype.dbInstance.executeSql = function(){throw new Error("please open db!");};
	DBFactory.prototype.dbInstance.selectSql = function(){throw new Error("please open db!");};
	DBFactory.prototype.dbInstance.transaction = function(){throw new Error("please open db!");};

//////////////////////////////////
///	辅助统用方法
	/**
	 * [isString 是否是字符串]
	 * @param  {[type]}  str [description]
	 * @return {Boolean}     [description]
	 */
	function isString(str){
		return (typeof str == 'string');
	}
	/**
	 * [isRightString 是否是非空字符串]
	 * @param  {[type]}  str [description]
	 * @return {Boolean}     [description]
	 */
	function isRightString(str){
		return isString(str) && (str.length > 0);
	}
	/**
	 * [isArray 是否是数据]
	 * @param  {Array}  arr [?]
	 * @return {Boolean}     [description]
	 */
	function isArray(arr){
		return (arr instanceof Array);
	}
	/**
	 * [isRightArray 是否是非空数组]
	 * @param  {[type]}  arr [description]
	 * @return {Boolean}     [description]
	 */
	function isRightArray(arr){
		return isArray(arr) && arr.length > 0;
	}

	/**
	 * [promiseReject 返回承诺并且拒绝]
	 * @param  {[type]} ret [description]
	 * @return {[type]}     [description]
	 */
	function promiseReject(ret){
		var deferred = q.defer();

		deferred.reject(ret);

		return deferred.promise;
	}
	/**
   	* [getKeyAndValueSqlStr 根据对象获取执行sql语句时的列名称与插入的值的字符串]
   	* @param  {Object} obj     [要获取属性名与值得对象]
   	* @param  {Stirng} connect [连接各个属性名称和值得字符]
   	* @return {Object}         [返回包含需求的sql字符串的对象{key:keyStr, value:valueStr}]
   	*/
 	var getKeyAndValueSqlStr = function(obj, connect){
	    if(obj == undefined){//要获取属性与值的对象是否没传?
	      return {key:"", value:""};
	    }

	    if(!isRightString(connect)){//连接字符是否没传?
	      var connect = ",";//默认为","
	    }

	    var keyStr = "";//保存对象的属性名称
	    var valueStr = "";//保存对象的属性名称对应的值
	    for(var key in obj){//开始遍历对象的属性和值
	      keyStr += key + connect;
	      var value = obj[key];
	      if(value === null){//是否是null
	        valueStr += value + connect;// null特殊处理
	      }else{
	        valueStr += "'" + value + "'" + connect;
	      }
	    }
	    
	    //去除末尾的连接字符
	    if(keyStr.length > 0){
	      keyStr = keyStr.substr(0, keyStr.length - connect.length);
	      valueStr = valueStr.substr(0, valueStr.length - connect.length);
	    }

	    return {key:keyStr, value:valueStr};
  	};
/////////////////////////////////
///数据库操作方法 
	/**
	* [executeSql 执行sql]
	* @param  {String} sql      [要执行的sql]
	* @param  {q.defer()} deferred [可选]
	* @return {Promise}          [承诺 获取执行的情况]
	*/
	function executeSql(sql, deferred){
		if(deferred == undefined){//是否没传入了deferred?
		  var deferred = q.defer();//获取defer
		}

		if(!isRightString(sql)){
			deferred.reject("sql is null");
		  	return deferred.promise;
		}

		//开始执行
		DBFactory.prototype.dbInstance.executeSql({name:"YsPos", sql:sql}, function(ret, err){
		  if(ret.status){//执行成功
		    deferred.resolve("OK");
		  }else{//执行查询sql出错
		    console.log("sql="+sql+"err==", err);
		    deferred.reject(err.msg);
		  }
		});

		return deferred.promise;
	};
	DBFactory.prototype.executeSql = executeSql;

	/**
	* [executeSelectSql 执行sql语句,并返回promise]
	* @param  {String} sql      [要执行的sql语句]
	* @param  {Deferred} deferred [可选参数 可不传]
	* @return {Promise}          [承诺 获取执行的结果]
	*/
	function executeSelectSql(sql, deferred){
		if(deferred == undefined){//是否没传入了deferred?
		  var deferred = q.defer();//获取defer
		}

		if(!isRightString(sql)){
		  deferred.reject("sql is null");
		  return deferred.promise;
		}

		DBFactory.prototype.dbInstance.selectSql({name:"YsPos", sql:sql}, function(ret, err){
		  if(ret.status){//执行成功
		    deferred.resolve(ret.data);
		  }else{//执行查询sql出错
		    deferred.reject(err.msg);
		  }
		});

		return deferred.promise;
	};
	DBFactory.prototype.executeSelectSql = executeSelectSql;

	/**
	* [executeSelectSqlArr 执行sql语句(兼容多条),并返回promise]
	* @param  {Array} sqlArr [要执行的sql语句数组 数据格式:[{name:name, sql:sql}, ...] 或 [sql1, sql2, ...]]
	* @return {Promise}        [承诺 获取执行的结果]
	*/
	function executeSelectSqlArr(sqlArr){
		if(!isRightArray(sqlArr)){//没有值则返回
		  return promiseReject("param must be a array and filled with data");
		}

		var sqlLength = sqlArr.length;//数据长度
		var allDeferred = q.defer();
		var promises = [];//保存所有的promise
		//执行sql
		for(var i = 0; i < sqlLength; ++i){
		  var deferred = q.defer();
		  var sqlObj = sqlArr[i];
		  //防止网络传输导致解析成json字符串的适配
		  if(isRightString(sqlObj)){
		    sqlObj = JSON.parse(sqlObj);
		  }
		  sqlArr[i] = sqlObj;

		  //保存
		  promises[i] = executeSelectSql(sqlObj.sql, deferred);
		}

		//适配前段的执行方式 $q.all的方法($q.all传入的可以是{key:promise, key:promise, ...})
		q.all(promises).then(function(res){//执行结果 全部成功则OK, 否则failed!
		    var result = {};
		    for(var i = 0; i < sqlArr.length; ++i){
		      result[sqlArr[i].name]= res[i];
		    }
		    allDeferred.resolve(result);
		  }, function(err){
		    allDeferred.reject(err);
		});

		return allDeferred.promise;//自定义的promise
	}
	DBFactory.prototype.executeSelectSqlArr = executeSelectSqlArr;

	/**
	* [executeOperationIntoDb 执行数据插入 注:多条(自定义)数据插入合并为一条语句进行插入]
	* @param  {String} tb                [表名称]
	* @param  {Array} dataArr           [数据数组]
	* @param  {Number} currentInstallNum [当前执行插入的次数]
	* @param  {Number} installNum        [总共要执行的插入次数]
	* @param  {Number} sqlNum            [每次插入数据库的条数(最大值)]
	* @param  {Defer} deferreds         [延迟对象数组]
	* @param  {String} operationType     [插入数据的方式(replace or insert)]
	* @return {[type]}                   [description]
	*/
	function executeOperationIntoDb(tb, dataArr, currentInstallNum, installNum, sqlNum, deferreds, operationType){
		if(currentInstallNum >= installNum){//是否已经插入完成?
		  return;
		}

		var sql = "";//保存数据库插入语句
		var index = currentInstallNum * sqlNum;//当前开始插入数据的index
		var leftSqlNum = dataArr.length - index;//剩余多少数据要插入
		var currentSqlNum = leftSqlNum > sqlNum ? sqlNum : leftSqlNum;//获取本次真正要插入的数据数量
		var keyValue = getKeyAndValueSqlStr(dataArr[index++]);//获取第一条数据的key与value
		 
		sql += operationType + " into " + tb + " (" + keyValue.key + ") values (" + keyValue.value + "),";

		//拼接插入语句
		for(var i = 1; i < currentSqlNum; ++i){
		  keyValue = getKeyAndValueSqlStr(dataArr[index++]);
		  sql += "(" + keyValue.value + "),";
		}
		sql = sql.substr(0, sql.length-1);//去除最后一个","
		// console.log("executeOperationIntoDb sql =", sql);
		executeSql(sql, deferreds[currentInstallNum]);//执行
		executeOperationIntoDb(tb, dataArr, currentInstallNum+1, installNum, sqlNum, deferreds, operationType);//递归调用 执行剩余的插入
	};

	/**
	* [handleBeforeExecuteOperation 执行]
	* @param  {String} tb      [数据库表名称]
	* @param  {Array} dataArr [数据(同一张表)]
	* @param  {String} operationType     [插入数据的方式(replace or insert)]
	* @return {Promise}         [执行的承诺]
	*/
	function handleBeforeExecuteOperation(tb, dataArr, operationType){
		if(!isRightString(tb)){
		  return promiseReject("table name is null");
		}
		if(!isRightArray(dataArr)){
		  // return promiseReject("data is null");
		  return q.when(tb + " data is null");
		}

		var onceInsertMaxNum = 500;//一条语句插入的最多条数
		var dataLength = dataArr.length;//数据的长度
		var installNum = Math.ceil(dataLength / onceInsertMaxNum);//插入多少次
		var sqlNum = dataLength < onceInsertMaxNum ? dataLength : onceInsertMaxNum;//一条sql包含多少条数据
		var deferreds = [];//保存全部的deferred
		var promises = [];//保存全部的promise

		//根据插入次数来赋值延迟对象与承诺
		for(var i = 0; i < installNum; ++i){
		  deferreds[i] = q.defer();
		  promises[i] = deferreds[i].promise;
		}

		//执行数据库插入 真正的数据插入
		executeOperationIntoDb(tb, dataArr, 0, installNum, sqlNum, deferreds, operationType);

		return q.all(promises);
	}


	/**
	 * [replaceIntoDbByTb 通过表的结构来插入数据]
	 * @param  {String} tb      [表名称]
	 * @param  {Array} dataArr [数据数组]
	 * @return {[type]}         [description]
	 */
	function replaceIntoDbByTb(tb, dataArr){
		if(!isRightString(tb)){
		  return promiseReject(" table name is null");
		}
		if(!isRightArray(dataArr)){
		  // return promiseReject(tb + " data is null");
		  return q.when(tb + " data is null");
		}
		

		//拼接values值 
        function get_values_str_by_fields(values, fields){
            var values_str = '';

            fields.forEach(function(field, index){
                var key = field.name;
                var value = values[key];
                if(typeof(value) == "undefined"){
                    var value = field.dflt_value;
                }
                if(value !== null){
                    values_str += '"'+ value + '"' + ',';
                }else{
                    values_str += value += ",";
                }
            });

            return values_str.substr(0, values_str.length-1);
        };
        //拼接fields值
        function get_fields_str(fields){
            // var fields_str = "";
            var nameArr = [];
            fields.forEach(function(field, index){
                // fields_str += field.name + ",";
                nameArr.push(field.name);
            });
            
            // return fields_str.substr(0, fields_str.length-1);
            return nameArr.join(",");
        };

		
		// "pragma table_info ('"+tb+"')"
		return executeSelectSql("desc "+tb).then(function(res){
			// return res;
			if(res.data && res.data.length >0){
				return promiseReject(tb+"is not exit!");
			}
			var fields = [];
			res.forEach(function(d, i){
				fields.push({
					name:d.Field,
					dflt_value: d.Default
				});
                // if(d.pk != 1 || d.type != "INTEGER"){
                //     if(typeof(d.dflt_value) == "string"){
                //         d.dflt_value.replace(new RegExp(/\'/g), "");
                //     }
                //     fields.push(d);
                // }
            });
            var sqlfields = get_fields_str(fields);
            var sql_string = "REPLACE INTO "+ tb +"("+sqlfields+") VALUES";
            var valueArr = [];
            for(var i = 0; i < dataArr.length; ++i){
            	valueArr.push("("+get_values_str_by_fields(dataArr[i], fields)+")");
            }
            sql_string += valueArr.join(",");

            // console.log("sql_string=" + sql_string);

            return executeSelectSql(sql_string);
		});
	}
	DBFactory.prototype.replaceIntoDbByTb = replaceIntoDbByTb;

	/**
	* [replaceIntoDb 替换的方式插入数据]
	* @param  {String} tb      [数据库表名称]
	* @param  {Array} dataArr [数据(同一张表)]
	* @return {Promise}         [执行的承诺]
	*/
	function replaceIntoDb(tb, dataArr){
		return handleBeforeExecuteOperation(tb, dataArr, "replace");
	}
	DBFactory.prototype.replaceIntoDb = replaceIntoDb;

	/**
	* [replaceAllIntoDb replace方式插入数据 支持多表数据插入]
	* @param  {Array} dataArr [要插入的数据 格式:[{tb:数据库表名称, data:[数据对象, ...]}, ...]]
	* @return {Promise}         [执行结果 全部成功才成功, 否则失败]
	*/
	function replaceAllIntoDb(dataArr){
		if(!isRightArray(dataArr)){//没有值则返回
		  // return promiseReject("data is null");
		  return q.when("data is null");
		}

		var dataLength = dataArr.length;//传入数据的个数(对应表)
		var promises = [];//保存所有的promise
		var index = 0;//promises的个数

		for(var i = 0; i < dataLength; ++i){
		  var data = dataArr[i];
		  if(data.data.length > 0){
		    promises[index++] = replaceIntoDb(data.tb, data.data);
		  }
		}

		return q.all(promises);//执行结果 全部成功则OK, 否则failed!
	}
	DBFactory.prototype.replaceAllIntoDb = replaceAllIntoDb;

	/**
	* [insertIntoDb 直接插入数据库]
	* @param  {String} tb   [数据库名称]
	* @param  {Object} data [数据 (单条)]
	* @return {Promise}      [承诺]
	*/
	function insertIntoDb(tb, data){
		if(!isRightString(tb)){
		  return promiseReject("tb  is null");
		}
		if(data == undefined){
		  // return promiseReject("data is null");
		  return q.when("data is null");
		}

		var keyValue = getKeyAndValueSqlStr(data, ",");//获取对象的key和value
		var sql = "insert into " + tb + " (" + keyValue.key + ") values (" + keyValue.value + ");";//拼装sql语句
		// console.log("insertIntoDb sql = ", sql);
		return executeSql(sql);//执行并返回
	}
	DBFactory.prototype.insertIntoDb = insertIntoDb;

	/**
	* [insertIntoDbMulti 多条数据插入数据库]
	* @param  {String} tb      [数据库表名称]
	* @param  {Array} dataArr [数据(同一张表)]
	* @return {Promise}         [执行的承诺]
	*/
	function insertIntoDbMulti(tb, dataArr){
		return handleBeforeExecuteOperation(tb, dataArr, "insert");
	}
	DBFactory.prototype.insertIntoDbMulti = insertIntoDbMulti;

	/**
	* [updateDb 更新数据]
	* @param  {String} tb    [数据库表名称]
	* @param  {Object} data  [更新的数据]
	* @param  {Object} where [更新条件]
	* @return {Promise}       [更新结果承诺]
	*/
	function updateDb(tb, data, where){
		//参数正确?
		if(!isRightString(tb)){
		  return promiseReject("tb is null.");
		}

		if(data == undefined){
		  // return promiseReject("data is null");
		  return q.when("data is null");
		}

		var sql = "update " + tb + " set ";//保存执行的sql
		var setValueStr = "";//设置更新的语句段
		for(var key in data){//获取更新的语句段
		  var value = data[key];
		  if(value === null){//null值处理
		    setValueStr += key + "=" + value + ",";
		  }else{
		    setValueStr += key + "='" + value + "',";
		  }
		}
		setValueStr = setValueStr.substr(0, setValueStr.length-1);//去除最后一个","
		sql += setValueStr;//拼接

		if(!(where == undefined)){//是否有条件?
		  var whereStr = " where 1=1";//保存条件
		  for(var key in where){//获取条件
		    var value = where[key];
		    if(value === null){//不是null?
		      whereStr += " and " + key + "=" + value+ ""; 
		    }else{
		      whereStr += " and " + key + "='" + value+ "'"; 
		    }
		  }
		  sql += whereStr;
		}

		return executeSql(sql);
	};
	DBFactory.prototype.updateDb = updateDb;

	/**
	* [updateDbMulti 更新多表的数据]
	* @param  {Array} dataArr [数据数组]
	* @return {Promise}         [执行情况通知的Promise]
	*/
	function updateDbMulti(dataArr){
		//参数正确?
		if(isRightArray(dataArr)){
		  // return promiseReject("data is null");
		  return q.when("data is null");
		}

		var dataLength = dataArr.length;//数据长度
		var promises = [];//保存所有执行通知的承诺
		for(var i = 0; i < dataLength; ++i){  
		  var data = dataArr[i];
		  promises[i] = updateDb(data.tb, data.data, data.where);
		}

		return q.all(promises);
	}
	DBFactory.prototype.updateDbMulti = updateDbMulti;

	/**
	* [updateDbAdd 在某字段值上累加]
	* @param  {String} tb    [数据库表名称]
	* @param  {Object} data  [更新的数据 注:此数据结构为{key:{add:boolean,field:*,value:*},...} 为了与前端一致!]
	* @param  {Object} where [条件]
	* @return {Promise}      [更新结果承诺]
	*/
	function updateDbAdd(tb, data, where){
		if(!isRightString(tb)){//参数正确?
		  return promiseReject("tb is null");
		}

		if(data == undefined){
		  // return promiseReject("data is null");
		  return q.when(tb + " data is null");
		}
		var sql = "update " + tb + " set ";//保存执行的sql
		var setValueStr = "";//设置更新的语句段
		for(var key in data){//获取更新的语句段
		  var value = data[key];
		  if(value != undefined){//null值处理
		    if(value.add){
		      setValueStr += value.field + "=ifnull(" + value.field + ",0)+'"+ value.value + "',";
		    }else{
		      setValueStr += value.field + "=" + value.value + "',";
		    }
		  }
		}
		setValueStr = setValueStr.substr(0, setValueStr.length-1);//去除最后一个","
		sql += setValueStr;//拼接


		if(where != undefined){//是否有条件?
		  var whereStr = " where 1=1";//保存条件
		  for(var key in where){//获取条件
		    var value = where[key];
		    if(value === null){//不是null?
		      whereStr += " and " + key + "=" + value+ " ";
		    }else{
		      whereStr += " and " + key + "='" + value+ "' "; 
		    }
		  }
		  sql += whereStr;
		}

		return executeSql(sql);
	}
	DBFactory.prototype.updateDbAdd = updateDbAdd;

	/**
	* [updateDbAddMulti 在某字段的值上累加]
	* @param  {Array} dataArr [数据数组]
	* @return {Promise}         [执行情况通知的Promise]
	*/
	function updateDbAddMulti(dataArr){
		//参数正确?
		if(!isRightArray(dataArr)){
		  // return promiseReject("data is null");
		  return q.when("data is null");
		}

		var dataLength = dataArr.length;//数据长度
		var promises = [];//保存所有执行通知的承诺
		for(var i = 0; i < dataLength; ++i){
		  var data = dataArr[i];  
		  promises[i] = updateDbAdd(data.tb, data.data, data.where);
		}

		return q.all(promises);
	}
	DBFactory.prototype.updateDbAddMulti = updateDbAddMulti;


	/**
	* [updateOrInsertIntoDb 更新或插入数据 适配前端dbReplace方法]
	* @param  {String} tb      [数据库表名称]
	* @param  {Array} dataArr [数据数组]
	* @param  {Array} keys    [判断是否存在的主键 (该主键可以是自定义的任何字段组合)]
	* @param  {Array} fields  [存在与主键相同的数据要更新的字段]
	* @param  {Array} add_fields  [存在与主键相同的数据要更新的字段 在原值的基础上]
	* @return {Promise}         [执行的promise 通知结果]
	*/
	function updateOrInsertIntoDb(tb, dataArr, keys, fields, add_fields){
		if(!isRightString(tb)){ 
		  return promiseReject("tb is null");
		}
		if(!isRightArray(dataArr)){
		  // return promiseReject("data is null");
		  return q.when(tb + " data is null");
		}

		var promises = [];//保存所有promise
		var dataLength = dataArr.length;//数据个数

		dataArr.forEach(function(data, i){
		  if(!isUndefinedOrNull(data)){//是否存在
		    var whereStr = " where 1=1";
		    var keyLength = keys.length;
		    for(var j = 0; j < keyLength; ++j){
		      var key = keys[j];
		      var tmpValue = data[key];
		      if(tmpValue !== null){
		        whereStr += " and " + key + "='" + tmpValue + "'";
		      }else{
		        whereStr += " and " + key + "=" + tmpValue;
		      }
		    }
		    var selectSql = "select * from " + tb  + whereStr; 
		    // console.log(selectSql);
		    executeSelectSql(selectSql).then(function(res){
		      // console.log("res==", res);
		      var updateSql = "update " + tb + " set ";
		      var fieldLength = fields.length;
		      for(var j = 0; j < fieldLength; ++j){
		        var field = fields[j];
		        updateSql += field + "='" + data[field] + "',";
		      }
		      if(isRightArray(add_fields)){
		        var addFieldsLength = add_fields.length;
		        for(var j = 0; j < addFieldsLength; ++j){
		          var field = add_fields[j];
		          updateSql += field + "=ifnull(" + field + ",0)+" + data[field] + ",";
		        }
		      }
		      updateSql = updateSql.substr(0, updateSql.length - 1);//去除最后一个","
		      updateSql += whereStr;
		      if(res.length > 0){//有数据 更新
		        // console.log("updateSql==", JSON.stringify(updateSql));
		        promises.push(executeSql(updateSql));
		      }else{//无数据 插入
		        var keyValue = getKeyAndValueSqlStr(data);
		        var insertSql = "insert into " + tb + "(" + keyValue.key + ") values (" + keyValue.value + ")"; 
		        // console.log("insertSql==", insertSql);
		        var insertPromise = executeSql(insertSql).catch(function(err){
		          //插入执行出错,可能是存在冲突,之前没有检查出来(因为select查询与insert插入不是原子性操作,导致多个查询执行后再执行插入),再次尝试下更新
		          return executeSql(updateSql);
		        });
		        promises.push(insertPromise);
		      }
		    }, function(err){
		      console.log("updateOrInsertIntoDb err = ", err);//打印错误,方便查看
		    });
		  }
		});

		return q.all(promises);
	}
	DBFactory.prototype.updateOrInsertIntoDb = updateOrInsertIntoDb;

	/**
	* [deleteDb 数据删除]
	* @param  {String} tb    [数据库表名称]
	* @param  {Array} where [删除条件]
	* @return {Promise}       [执行结果通知]
	*/
	function deleteDb(tb, where){
		if(!isRightString(tb)){
		  return promiseReject("tb is null");
		}

		var whereStr = " where 1=1";//条件语句段
		//获取条件
		for(var key in where){
		  var value = where[key];
		  if(value !== null){
		    whereStr += " and " + key + "='" + value + "'"; 
		  }else{
		    whereStr += " and " + key + "=" + value;
		  }
		} 
		//拼接删除语句
		var sql = "delete from " + tb + whereStr;

		return executeSql(sql);//执行
	}
	DBFactory.prototype.deleteDb = deleteDb;


	/**
	* [transactionBegin 事务开始]
	* @return {Promise} [执行结果通知]
	*/
	function transactionBegin() {
		var deferred = q.defer();
		var promise = deferred.promise;
		DBFactory.prototype.dbInstance.transaction({
		    'name': 'YsPos',
		    'operation': 'begin'
		}, function (ret, err) {
		    if (ret.status) {
		        deferred.resolve('事务操作成功');
		    } else {
		        deferred.reject(err.msg);
		    }
		});

		return promise;
	};

	DBFactory.prototype.transactionBegin = transactionBegin;

	/**
	* [transactionCommit 事务提交]
	* @return {Promise} [执行结果通知]
	*/
	function transactionCommit() {
		var deferred = q.defer();
		var promise = deferred.promise;
		DBFactory.prototype.dbInstance.transaction({
		    'name': 'YsPos',
		    'operation': 'commit'
		}, function (ret, err) {
		    if (ret.status) {
		        deferred.resolve('事务提交成功');
		    } else {
		        deferred.reject(err.msg);
		    }
		});

		return promise;
	};
	DBFactory.prototype.transactionCommit = transactionCommit;

	/**
	* [transactionRollback 事务回滚]
	* @return {Promise} [执行结果通知]
	*/
	function transactionRollback() {
		var deferred = q.defer();
		var promise = deferred.promise;
		// console.log("开始回滚------");
		DBFactory.prototype.dbInstance.transaction({
		    'name': 'YsPos',
		    'operation': 'rollback'
		}, function (ret, err) {
		    if (ret.status) {
		      // console.log("事务回滚成功====", ret);
		        deferred.resolve('事务回滚成功');
		    } else {
		        console.log("事务回滚失败====", err.msg);
		        deferred.reject(err.msg);
		    }
		});

		return promise;
	};
	DBFactory.prototype.transactionRollback = transactionRollback;

	/**
	 * [openDB 打开数据库]
	 * @param  {Object} params [打开数据库所需要的参数 mysql:{host:数据库ip, user:用户名, password:密码, database:数据库名称}]
	 * @return {[type]}        [description]
	 */
	DBFactory.prototype.openDB = function(params){
		//sql底层执行适配
		function dbAdaptor(db){
			DBFactory.prototype.dbInstance = {db:db, isClose:false, isOpen:true};
	    	//执行操作sql原句
	    	DBFactory.prototype.dbInstance.executeSql = function(params, callback){
	    		DBFactory.prototype.dbInstance.db.query(params.sql, function(err, res){
	                var ret = {status:true};
	                var error = {};
	                if (err) {
	                    error.msg = err;  
	                    ret.status = false;    
	                } 
	                callback(ret, error);
	            });
	    	};
	    	//执行查询sql
			DBFactory.prototype.dbInstance.selectSql = function(params, callback){
				DBFactory.prototype.dbInstance.db.query(params.sql, function(err, res){
	                var ret = {status:true, data:res};
	                var error = {};
	                if (err) {
	                    error.msg = err;  
	                    ret.status = false;    
	                } 
	                callback(ret, error);
	            });
			};
			//嵌套事务 ==========================================================
	        DBFactory.prototype.transCtrl = {};
	        DBFactory.prototype.transCtrl.transactionLock = false;//事务锁 在正真开启下一个事之前锁住 处理所有事务回调
	        DBFactory.prototype.transCtrl.transactionNum = 0;//目前启动的事务数
	        DBFactory.prototype.transCtrl.callbackArr = [];//保存回调函数块的数组 
	        DBFactory.prototype.transCtrl.callbackNums = 0;//回调的个数
	        DBFactory.prototype.transCtrl.isBegin = false;//事务是否正真开启了 默认没有
	        DBFactory.prototype.transCtrl.beginPendingCallbackArr = [];//锁住时候开启事务的等待数组
	        DBFactory.prototype.transCtrl.beginPendingCallbackNums = 0;//锁住时候开启事务的等待个数

	        //处理被挂起的开启事务进程
	        DBFactory.prototype.transCtrl.beginPendingHandle = function(){
	            if(DBFactory.prototype.transCtrl.beginPendingCallbackNums > 0){
	                if(DBFactory.prototype.transCtrl.isBegin == true){
	                    for(var i = 0; i < DBFactory.prototype.transCtrl.beginPendingCallbackNums; ++i){
	                        var beginPendingCallbackData = DBFactory.prototype.transCtrl.beginPendingCallbackArr[i];
	                        if(beginPendingCallbackData != null){
	                            DBFactory.prototype.dbInstance.transaction(beginPendingCallbackData.trans, beginPendingCallbackData.callback);
	                        }
	                    }
	                    DBFactory.prototype.transCtrl.beginPendingCallbackNums = 0;
	                    DBFactory.prototype.transCtrl.beginPendingCallbackArr = [];
	                }else{
	                    var beginPendingCallbackData = DBFactory.prototype.transCtrl.beginPendingCallbackArr[0];
	                    DBFactory.prototype.transCtrl.beginPendingCallbackArr[0] = null;
	                    DBFactory.prototype.dbInstance.transaction(beginPendingCallbackData.trans, beginPendingCallbackData.callback);
	                }
	            }
	        };

	        //事务回调处理
	        DBFactory.prototype.transCtrl.transactionHandler = function(ret, error, isRollback){
	            if(typeof(isRollback) == "undefined" || !isRollback){
	                //处理所有的回调 
	                for(var i = 0; i < DBFactory.prototype.transCtrl.callbackNums; ++i){
	                    var tmpCallBack = DBFactory.prototype.transCtrl.callbackArr[i].callback;
	                    if(tmpCallBack){
	                        tmpCallBack(ret, error);//通知全部嵌套的事务
	                        DBFactory.prototype.transCtrl.callbackArr[i] = null;//置空 释放空间
	                    }
	                }
	            }else{
	                var originStatus = ret.status;
	                //处理所有的回调 
	                for(var i = 0; i < DBFactory.prototype.transCtrl.callbackNums; ++i){
	                    var tmp = DBFactory.prototype.transCtrl.callbackArr[i];
	                    var tmpCallBack = tmp.callback;
	                    if(!(tmp.isRollback)){//不是roallback的事务回调?
	                        ret.status = false;//全部置为false
	                    }else{
	                        ret.status = originStatus;
	                    }
	                    
	                    if(tmpCallBack){
	                        tmpCallBack(ret, error);//通知全部嵌套的事务
	                        DBFactory.prototype.transCtrl.callbackArr[i] = null;//置空 释放空间
	                    }
	                }
	            }
	            

	            //还原初始化值
	            DBFactory.prototype.transCtrl.transactionNum = 0; 
	            DBFactory.prototype.transCtrl.callbackNums = 0;
	            DBFactory.prototype.transCtrl.isBegin = false;
	            DBFactory.prototype.transCtrl.callbackArr = [];
	            DBFactory.prototype.transCtrl.transactionLock = false;//最后才开启事务锁

	            if(DBFactory.prototype.transCtrl.beginPendingCallbackNums > 0){//是否有被挂起的开启事务?
	                DBFactory.prototype.transCtrl.beginPendingHandle();
	            }
	        };

			//事务
			DBFactory.prototype.dbInstance.transaction = function(trans, callback){
				if(!trans.name){
	                var operation = trans.operation;
	                var trans = {name:"YsPos", operation:operation}//默认主数据库
	            }
	            
	            if(trans.operation == "rollback"){//回滚 ?
	                DBFactory.prototype.transCtrl.transactionLock = true;//所有嵌套的事务都需要回滚!!! 不允许再添加事务了
	                --DBFactory.prototype.transCtrl.transactionNum;

	                var callbackData = {};
	                callbackData.callback = callback;
	                callbackData.isRollback = true;
	                DBFactory.prototype.transCtrl.callbackArr[DBFactory.prototype.transCtrl.callbackNums++] = callbackData;//保存回调函数//callbackData;//
	            }else if(trans.operation == "begin"){//开启事务
	                if(DBFactory.prototype.transCtrl.transactionLock){//已经锁住?
	                    DBFactory.prototype.transCtrl.beginPendingCallbackArr[DBFactory.prototype.transCtrl.beginPendingCallbackNums++] = {callback:callback, trans:trans};//保存事务开启, 等之前的事务处理结束
	                    // callback({status:false}, {msg:"Has locked!!!"});//锁住了,直接失败
	                    return;
	                }
	                if(DBFactory.prototype.transCtrl.isBegin){//是否已经开启了?
	                    ++DBFactory.prototype.transCtrl.transactionNum;//嵌套事务数加一
	                    callback({status:true}, {});//已经开启了
	                }else{
	                    DBFactory.prototype.transCtrl.transactionLock = true;//锁住 防止多次开启
	                    //真正的事务开启操作!!
	                    DBFactory.prototype.dbInstance.db.beginTransaction(function(err, res){
	                        var ret = {status: true};
	                        var error = {};
	                        if (err) {//开始失败
	                            error.msg = err;  
	                            ret.status = false;    
	                        } else {//开启成功
	                            ++DBFactory.prototype.transCtrl.transactionNum;//嵌套事务数加一
	                            DBFactory.prototype.transCtrl.isBegin = true;//事务开启啦
	                        }

	                        DBFactory.prototype.transCtrl.transactionLock = false;
	                        if(DBFactory.prototype.transCtrl.beginPendingCallbackNums > 0){//是否有被挂起的开启事务?
	                            DBFactory.prototype.transCtrl.beginPendingHandle(ret, error);
	                        }
	                        callback(ret, error); 
	                    });
	                }
	            }else if(trans.operation == "commit"){//提交数据
	                --DBFactory.prototype.transCtrl.transactionNum;
	                var callbackData = {};
	                callbackData.callback = callback;
	                callbackData.isRollback = false;
	                DBFactory.prototype.transCtrl.callbackArr[DBFactory.prototype.transCtrl.callbackNums++] = callbackData;//保存回调函数
	            }
	            
	            if(DBFactory.prototype.transCtrl.transactionNum <= 0 && DBFactory.prototype.transCtrl.isBegin){//没有事务在处理了? 且事务是开启的
	                if(DBFactory.prototype.transCtrl.transactionLock){//已经锁住了, 说明发送rollback事务操作, 有错误
	                    DBFactory.prototype.dbInstance.db.rollback(function(err, res){//出现错误 数据回滚
	                        if(!err){
	                            DBFactory.prototype.transCtrl.transactionHandler({status:true}, {msg:"rollback success!"}, true);
	                        }else{
	                            console.log("rollback err=", err);
	                            DBFactory.prototype.transCtrl.transactionHandler({status:false}, {msg:"rollback error!"}, true);
	                        }
	                    });
	                }else{//没有 说名全部执行ok了!! fantastic!
	                    DBFactory.prototype.transCtrl.transactionLock = true;//这次锁住,防止其他事务再加入, 处理所有的commit回调
	                    DBFactory.prototype.dbInstance.db.commit(function(err, res){//真正提交数据
	                        if(!err){
	                            DBFactory.prototype.transCtrl.transactionHandler({status:true}, {});
	                        }else{
	                            console.log("commit err=",err);
	                            DBFactory.prototype.transCtrl.transactionHandler({status:false}, {msg:"commit has error occurred!"});
	                        }
	                    });
	                }
	            }
			};
		}

		var ret = {status:true, message:"open success"}
		if(!DBFactory.prototype.dbInstance || !DBFactory.prototype.dbInstance.isClose){
			console.log("openDB~", process.pid);
			var mysql = require("mysql");
			var deferred = q.defer();
			var db = mysql.createConnection({
	            host: params.host,
	            user: params.user,
	            password: params.password,
	            database: params.database
	        }); 
	        db.connect(function(err, res){
	            if(err){
	                ret.status = false;
	                ret.message = err;
	                deferred.reject(ret);
	            }else{
	            	dbAdaptor(db);
	            	deferred.resolve(ret);
	            }
	            
	        });

	        return deferred.promise;
		}

		return $q.when(ret);
	};

	DBFactory.prototype.closeDB = function(){
		var deferred = q.defer();
		if(DBFactory.prototype.dbInstance){
			DBFactory.prototype.dbInstance.db.end(function(err, res){
				if(err){
					return deferred.reject({status:false, message:err});
				}
				DBFactory.prototype.dbInstance.db.destroy();
				DBFactory.prototype.dbInstance.isOpen = false;
				DBFactory.prototype.dbInstance.isClose = true;
				return deferred.resolve({status:true, message:"ok"});
			});
		}

		return deferred.promise;
	};

	return new DBFactory();
});

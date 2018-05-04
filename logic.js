/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global getAssetRegistry getFactory */
var _MS_PER_DAY = 1000 * 60 * 60 * 24;

function largeOrder() {
  	return getAssetRegistry('org.acme.otc.OpenOrder')
  		.then(function(ar) {
      		return ar.getAll();
    	})
  		.then(function(arr) {
      		//console.log('Arr: ',arr);
      		var mx = 0;
      		arr.forEach(function(contract) {
              	var tmp = parseInt((contract.ISINcode.split(":"))[1]);
              	if (mx < tmp) {
                  	mx = tmp;
                }
            });
      		return mx;
    	});
}


/**
 * Publish a new bond
 * @param {org.acme.otc.PlaceOrder} publishBond - the publishBond transaction
 * @transaction
 */



async function publish(placeOrder) { // eslint-disable-line no-unused-vars
 	var mx= await largeOrder();
    return getParticipantRegistry('org.acme.otc.Administrator')
        .then(function(participantRegistry) {
            // Get all of the drivers in the driver participant registry.
            return participantRegistry.getAll();
        })
        .then(function(drivers) {
      		//console.log('Admins: ',drivers);
            // Process the array of driver objects.
            drivers.forEach(function(driver) {
                if (driver.tradingOpen == false) {
                    throw new Error('Trading Not Open.')
                };
            });
        })
        .then(function(driver) {
            return getAssetRegistry('org.acme.otc.OpenOrder');
        })
        .then(function(registry) {

            const factory = getFactory();
			//console.log('Got Factory');
            // Create the bond asset.
      		mx++;
            const openOrder = factory.newResource('org.acme.otc', 'OpenOrder', 'ISINcode:'+mx);
            openOrder.order = placeOrder.order;
      		openOrder.valid = true;
			//console.log('New Order: ',openOrder);
            // Add the bond asset to the registry.
            return registry.add(openOrder);
        })


}

function updateAdmin(id,val) {
    return getParticipantRegistry('org.acme.otc.Administrator')
        .then(function(participantRegistry) {
            var factory = getFactory();
            const entry = participantRegistry.getAll();
            var new_admin = factory.newResource('org.acme.otc', 'Administrator', id);
      		//console.log('ID: ',id);
      		//console.log('Val: ',val);
            new_admin.tradingOpen = val;
      		//console.log('NEW ADMIN: ', new_admin);
            return participantRegistry.update(new_admin);
        })
}


/**
 * Start of Day Update
 * @param {org.acme.otc.SOD} sod - the sod transaction
 * @transaction
 */
function SOD(sod) { // eslint-disable-line no-unused-vars
    var aR = null;
    return getAssetRegistry('org.acme.otc.LiveContract')
        .then(function(contractRegistry) {
            aR = contractRegistry;
            return aR.getAll();
        })
        .then(function(l) {
            allContracts = [];
            allContracts = l;
            //console.log('Curr List: ', allContracts);
            var q = new Date();
            var m = q.getMonth();
            var d = q.getDay();
            var y = q.getFullYear();
            var date = new Date(y, m, d);
            //console.log('Current Date: ', date);
            arr = [];
            allContracts.forEach(function(contract) {
                if (contract.contract.expiry < date) {
                    arr.push(contract);
                }
            })
            return arr;
        })
        .then(function(arr) {
            var factory = getFactory();
            new_arr = [];
            fLen = arr.length;
            for (i = 0; i < fLen; i++) {
                var old_contract = arr[i];
                //console.log('ISIN: ', old_contract.ISINcode);
                var new_contract = factory.newResource('org.acme.otc', 'LiveContract', old_contract.ISINcode);
                //console.log('Entry: ', old_contract);
                new_contract.contract = old_contract.contract;
                new_contract.valid = false;
                new_arr.push(new_contract);
            }
            //console.log(new_arr);
      		return aR.updateAll(new_arr);
        })
  		.then(function(arr) {
      		return updateAdmin(sod.adminId,true);
   		})
}

function nc(b,s,od,v) {
  	this.buyerId = b;
  	this.sellerId = s;
  	this.orderDetails = od;
  	this.value = v;
}

function normal_random(mean, variance) {
    if (mean == undefined)
        mean = 0.0;
    if (variance == undefined)
        variance = 1.0;
    var V1, V2, S;
    do {
        var U1 = Math.random();
        var U2 = Math.random();
        V1 = 2 * U1 - 1;
        V2 = 2 * U2 - 1;
        S = V1 * V1 + V2 * V2;
    } while (S > 1);

    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    X = mean + Math.sqrt(variance) * X;
    return X;
}

function randn_bm() {
    x = normal_random(0, 1);
    return x;
};

function updatePrice(price) {
    var x = randn_bm();
    var new_contract = null;
    var ar = null;
  	//console.log('Ticker to Update: ',price.Ticker);
    return getAssetRegistry('org.acme.otc.Underlying')
        .then(function(underRegistry) {
            ar = underRegistry;
            return ar.get(price.Ticker);
        }).then(function(oldUnder) {
            //console.log('Old Underlying', oldUnder);
            var factory = getFactory();
            new_contract = factory.newResource('org.acme.otc', 'Underlying', oldUnder.Ticker);
            new_contract.price = oldUnder.price;
            return new_contract;
        }).then(function(new_contract) {
            //console.log('Normal Return: ', x);
            var new_price = new_contract.price * (1 + x / 100);
            //console.log('New Price', new_price);
            new_contract.price = new_price
            //console.log('New Underlying', new_contract);
            return ar.update(new_contract);
        });
}

function largeISIN() {
  	return getAssetRegistry('org.acme.otc.LiveContract')
  		.then(function(ar) {
      		return ar.getAll();
    	})
  		.then(function(arr) {
      		var mx = 0;
      		arr.forEach(function(contract) {
              	var tmp = parseInt((contract.ISINcode.split(":"))[1]);
              	if (mx < tmp) {
                  	mx = tmp;
                }
            });
      		return mx;
    	});
}


async function pair() {
  	var OR = null;
  	var newContracts = null;
  	var maxISIN = await largeISIN();
  	//console.log('Max ISIN: ',maxISIN);
  	return getAssetRegistry('org.acme.otc.OpenOrder')
  		.then(function(orderregistry) {
      		OR = orderregistry;
      		return OR.getAll();
   		})
  		.then(function(arr) {
      		var valid = [];
      		arr.forEach(function(orderr) {
              	if (orderr.valid == true) {
                  	valid.push(orderr);
                }
            });
      		var doneOrder = [];
      		newContracts = [];
      		var vLen = valid.length;
      		var factory = getFactory();
      		valid.forEach(function(order) {
              	newOrder = factory.newResource('org.acme.otc', 'OpenOrder', order.ISINcode);
              	newOrder.valid = false;
              	newOrder.order = order.order;
            	OR.update(newOrder);
              	if (doneOrder.includes(order.ISINcode)) {
                  	return;
                }
              	doneOrder.push(order.ISINcode);
                var otherId = order.order.otherTraderId;
              	var orderSide = order.order.buy;
              	var od = order.order.details;
              	valid.forEach(function(v) {
                  	if (doneOrder.includes(v.ISINcode)) {
                      	return;
                	}
                  	var candId = v.order.traderId;
                  	var candSide = v.order.buy;
                  	var cd = v.order.details;
                  	var bool1 = (candId == otherId);
                  	var bool2 = (od.asset == cd.asset)&&(od.expiry.toString()==cd.expiry.toString())&&(od.notionalAmount == cd.notionalAmount)&&(od.productType == cd.productType);
                  	var bool3 = (orderSide != candSide);
                  	if (bool1 && bool2 && bool3) {
                      	doneOrder.push(v.ISINcode);
                      	maxISIN++;
                      	const newContract = factory.newResource('org.acme.otc', 'LiveContract', 'ISINcode:'+maxISIN);
                      	//console.log('String ID: ','ISINcode:'+maxISIN);
                      	newc = factory.newConcept('org.acme.otc', 'Contract');
                      	if (candSide) {
                        	newc.buyerId = candId;
                          	newc.sellerId = order.order.traderId;
                        }
                      	else {
                          	newc.buyerId = candId;
                          	newc.sellerId = order.order.traderId;
                        }
                      	newc.details = od;
                      	newc.value = 0;
                      	newContract.contract = newc;
                      	newContract.valid = true;
                      	newContracts.push(newContract);
                    }
                });
            });
      		//console.log(newContracts);
      		return newContracts;
    	})
      	.then(function(nc) {
          	return getAssetRegistry('org.acme.otc.LiveContract')
          		.then(function(cr) {
                  	cr.addAll(newContracts);
                });  
        });
}

function updateAllUnderlyings(){
  return getAssetRegistry('org.acme.otc.Underlying')
        .then(function(underRegistry) {
    		return underRegistry.getAll();
  		})
  		.then(function(allUnders){
    		allUnders.forEach(function(under){
              updatePrice(under);
            });
  		});
}

function mark() {
  	var debts = [];
  	var factory = getFactory();
  	var q = new Date();
    var m = q.getMonth();
    var d = q.getDay();
    var y = q.getFullYear();
    var date = new Date(y, m, d);
  	//console.log('Todays Date: ',date);
  	var lc;
  	var ul = null;
  	
  	return getAssetRegistry('org.acme.otc.Underlying')
  		.then(function(ull) {
      		ul=ull.getAll()
      		return ul;
    	})
    .then(function(ul){
    //console.log('Underlyings: ',ul);
  	return getAssetRegistry('org.acme.otc.LiveContract')
  		.then(function(livec) {
      		lc = livec;
      		return lc.getAll();
   		})
  		.then(function(arr) {
      		//console.log('Contracts to be considered: ',arr);
      		var valid = [];
      		arr.forEach(function(orderr) {
              	if (orderr.valid == true) {
                  	valid.push(orderr);
                }
            })
      		//console.log('Valids: ',valid);
      		var marked = [];
      		var debt=null;
      		valid.forEach(function(contract) {
              	var newValue=null;
              	if (contract.contract.details.productType == 'FORWARD') {
                  	ul.forEach(function(u) {
                      	if (u.Ticker == contract.contract.details.asset) {
                          	var day_diff = Math.round(Math.abs((contract.contract.details.expiry.getTime() - date.getTime())/(_MS_PER_DAY)));
                          	if (day_diff>2){
                                var exp_val=Math.exp(.03*day_diff);
                                //console.log('Day Difference: ',day_diff);
                                //console.log('Exponential Value: ',exp_val);
                              	//console.log('Underlying Price: ',u.price);
                              	//console.log('Notional Amount: ',contract.contract.details.notionalAmount);
                              	//console.log('Curr Value: ',contract.contract.value);
                              	//newValue=0;
                                newValue = (u.price*exp_val)*contract.contract.details.notionalAmount;
                                debt = newValue-contract.contract.value;
                                //console.log('Forward New Value: ',newValue);
                            }
                          	else {
                              	//console.log('Day Difference: ',0);
                                newValue=contract.contract.value;
                              	debt=0;
                              	//console.log('Forward New Value: ',newValue);
                            }
                        }
                    });
                }
                else if (contract.contract.details.productType == 'OPTION') {
                  	ul.forEach(function(u) {
                      	if (u.Ticker == contract.contract.details.asset) {
                          	newValue = contract.contract.value;
                          	debt = newValue-contract.contract.value;
                          	//console.log('Option New Value: ',newValue);
                        }
                    });
                }
                else if (contract.contract.details.productType == 'SWAP') {
                  	ul.forEach(function(u) {
                      	if (u.Ticker == contract.contract.details.asset) {
                          	newValue = contract.contract.value;
                          	debt = newValue-contract.contract.value;
                          	//console.log('Swap New Value: ',newValue);
                        }
                    });
                }
                var od = contract.contract.details;
                const newContract = factory.newResource('org.acme.otc', 'LiveContract', contract.ISINcode);
                var newc = factory.newConcept('org.acme.otc', 'Contract');
                newc.details = od;
              	newc.buyerId=contract.contract.buyerId;
              	newc.sellerId=contract.contract.sellerId;
                newc.value = newValue;
                newContract.contract = newc;
                newContract.valid = true;
                marked.push(newContract);
                debts.push([contract.contract.sellerId,contract.contract.buyerId,debt]);
              	//console.log('Old Value: ',contract.contract.value);
              	
           	});
      		//console.log('Marked: ',marked);
      		//console.log('Debts: ',debts);
        	return marked;
     	})
      	.then(function(marked) {
          	return getAssetRegistry('org.acme.otc.LiveContract')
          		.then(function(cr) {
                  	cr.updateAll(marked);
              		return debts;
                });  
        })
    });
}
            
                  
function settlements(debts){
  var parts = {};
  var settlements=[];
  return getParticipantRegistry('org.acme.otc.Trader')
        .then(function(participantRegistry) {
            // Get all of the drivers in the driver participant registry.
            return participantRegistry.getAll();
        })
        .then(function(traders) {
    		//console.log('All Traders: ',traders);
    		traders.forEach(function(trader){
              parts[trader.traderId]=0;
            });
    		//console.log('Empty Debts: ', parts);
    		return parts;
  		})
  		.then(function(parts){
    		debts.forEach(function(debt) {
              parts[debt[0]]-=debt[2];
              parts[debt[1]]+=debt[2];
            });
    		//console.log('Complete Debts: ', parts);
    		while (Object.keys(parts).map(function(key){return parts[key];}).filter(i => i != 0).length!=0){
              var condition=Object.keys(parts).map(function(key){return parts[key];}).filter(i => i != 0).length;
              //console.log('Condition: ',condition);
              var z= Object.keys(parts).map(function(key){return parts[key];});
              //console.log('z: ',z);
              var zz = Object.keys(parts);
              //console.log('zz: ',zz);
              
              var negative_vals=z.filter(i => i < 0);
              var neg=z.indexOf(negative_vals[0]);
              //console.log('neg: ',neg);
              
              var positive_vals=z.filter(i => i > 0);
              var pos=z.indexOf(positive_vals[0]);
              //console.log('pos: ',pos);
              
              var s=z[neg];
              //console.log('s: ',s);
              var t=z[pos];
              //console.log('t: ',t);
              
              var m=Math.min(-s,t);
              //console.log('m: ',m);
              parts[zz[neg]]+=m;
              
              parts[zz[pos]]-=m;
              settlements.push([zz[neg],zz[pos],m]);
            }
    		//console.log('Condition At End: ',Object.keys(parts).map(function(key){return parts[key];}).filter(i => i != 0).length);
    		//console.log('Settlements: ',settlements);
    		return settlements;
  	});
}

function updateTrader(trader){
	return getParticipantRegistry('org.acme.otc.Trader')
		.then(function(participantRegistry) {
            // Get all of the drivers in the driver participant registry.
            return participantRegistry.update(trader);
        })
}
function updateMargins(settlements){
  	var factory=getFactory();
	return getParticipantRegistry('org.acme.otc.Trader')
		.then(function(participantRegistry) {
            // Get all of the drivers in the driver participant registry.
            return participantRegistry.getAll();
        })
        .then(function(traders) {
      		var final_margins={};
      		traders.forEach(function(trader){
            	final_margins[trader.traderId]=trader.margin;
            });
      		console.log('Margin Dict: ',final_margins);
     		settlements.forEach(function(settlement){
        		final_margins[settlement[0]]-=settlement[2];
              	final_margins[settlement[1]]+=settlement[2];
            });
      		console.log('Margin Dict Updated: ',final_margins);
      		return final_margins;
    	})
  		.then(function(margins){
      		var new_traders=[];
        	Object.keys(margins).forEach(function(key) {
              	const trader = factory.newResource('org.acme.otc', 'Trader', key);
    			trader.margin=margins[key];
              	//console.log('New Trader: ',trader);
              	new_traders.push(trader);
              	//updateTrader(trader);
			});
      		
      		return new_traders
    	})
  		.then(function(traders) {
          	return getParticipantRegistry('org.acme.otc.Trader')
          		.then(function(tr) {
              		console.log('New Traders: ',traders);
              		return tr.updateAll(traders);
                });  
        })
}
          	
              	
      		

/**
 * Random Normal Return
 * @param {org.acme.otc.EOD} EOD - the EOD transaction
 * @transaction
 */

async function EOD(eod) {
  	var tmp = updateAdmin(eod.adminId,false);
  	updateAllUnderlyings();
  	var tmp2=pair();
  	var debts= await mark();
  	//console.log('Debts: ',debts);
  	var settlement= await settlements(debts);
  	//console.log('Settlements 1: ',settlement);
  	var updates=await updateMargins(settlement);
  	var q = new Date();
    var m = q.getMonth();
    var d = q.getDay();
    var y = q.getFullYear();
  	var date = new Date(y, m, d);
  	factory=getFactory();
  	
  	settlement.forEach(function(settle){
      	const placeOrderEvent = factory.newEvent('org.acme.otc', 'NettedDebts');
      	placeOrderEvent.date = date;
      	placeOrderEvent.debts = (Object.values(settle)).map(String);
    	emit(placeOrderEvent);
    });
}
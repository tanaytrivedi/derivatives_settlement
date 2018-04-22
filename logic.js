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

/**
 * Publish a new bond
 * @param {org.acme.otc.PlaceOrder} publishBond - the publishBond transaction
 * @transaction
 */
async function publish(placeOrder) {  // eslint-disable-line no-unused-vars

    return getParticipantRegistry('org.acme.otc.Administrator')
    .then(function (participantRegistry) {
      // Get all of the drivers in the driver participant registry.
      return participantRegistry.getAll();
    })
    .then(function (drivers) {
      // Process the array of driver objects.
      drivers.forEach(function (driver) {
        if (driver.tradingOpen==false){
          throw new Error('Trading Not Open')};
        });
    })
      .then(function(driver){ return getAssetRegistry('org.acme.otc.OpenOrder');})
    .then(function(registry) {
      
        const factory = getFactory();
  
      // Create the bond asset.
      const openOrder = factory.newResource('org.acme.otc', 'OpenOrder', placeOrder.ISINCode);
      openOrder.order = placeOrder.order;
  
      // Add the bond asset to the registry.
      return registry.add(openOrder);  
    })
          
  }
  
  function invalidate(arr){
      return getAssetRegistry('org.acme.otc.LiveContract')
    .then(function (vehicleAssetRegistry) {
      console.log(arr);
      return vehicleAssetRegistry.updateAll(arr);
    }) 
  }
  
  function pare(){
    return getAssetRegistry('org.acme.otc.LiveContract')
        .then(function (contractRegistry){
          
          return contractRegistry.getAll();
    })
        .then(function (l){
          allContracts=l;
          //console.log('Curr List: ',allContracts);
          var q = new Date();
          var m = q.getMonth();
          var d = q.getDay();
          var y = q.getFullYear();
          var date = new Date(y,m,d);
          var arr=[];
          allContracts.forEach(function(contract) {
            //console.log('Contract Date: ',contract.contract.expiry);
            if (contract.contract.expiry<date) {
              //console.log('Checks Out');
              //console.log('Destroying: ',contract);
              
              arr.push(contract.ISINcode);
              //console.log('Return: ',x);
            } 
          }) 
      return arr
      }) 
  }
              /**
              var index = allContracts.indexOf(contract);
              if (index > -1) {allContracts.splice(index, 1);}
            }
          })
          //var factory = getFactory();
          var arr = [];
          var factory = getFactory();
          allContracts.forEach(function(contract) {
            var new_contract=factory.newResource('org.acme.otc','LiveContract',contract.ISINcode);
            new_contract.contract=contract.contract;
            arr.push(new_contract);
          })
          console.log('Updates: ',arr);
          return destroy(arr); **/
    
  
  /**
   * Start of Day Update
   * @param {org.acme.otc.Test} test - the test transaction
   * @transaction
   */
  function Test(test) {
  
    return getAssetRegistry('org.acme.otc.LiveContract')
      .then(function (participantRegistry) {
        // Get all of the drivers in the driver participant registry.
        return participantRegistry.getAll();
      })
      .then(function (drivers) {
        // Process the array of driver objects.
        drivers.forEach(function (driver) {
          console.log(driver);
        });
      })
  }
  
            
  /**
   * Start of Day Update
   * @param {org.acme.otc.SOD} sod - the sod transaction
   * @transaction
   */
  function SOD(sod) {  // eslint-disable-line no-unused-vars
    //arr=pare();
    return getAssetRegistry('org.acme.otc.LiveContract')
        .then(function (contractRegistry){
          
          return contractRegistry.getAll();
    })
        .then(function (l){
          allContracts=l;
          //console.log('Curr List: ',allContracts);
          var q = new Date();
          var m = q.getMonth();
          var d = q.getDay();
          var y = q.getFullYear();
          var date = new Date(y,m,d);
          var arr=[];
          allContracts.forEach(function(contract) {
            //console.log('Contract Date: ',contract.contract.expiry);
            if (contract.contract.expiry<date) {
              //console.log('Checks Out');
              //console.log('Destroying: ',contract);
              
              arr.push(contract);
              //console.log('Return: ',x);
            } 
          }) 
      return arr
      }).then( function(arr){
          var factory = getFactory();
          new_arr=[];
          
          fLen = arr.length;
          for (i = 0; i < fLen; i++) {
              var old_contract=arr[i];
                console.log('ISIN: ',old_contract.ISINcode);
                var new_contract = factory.newResource('org.acme.otc', 'LiveContract', old_contract.ISINcode);
                console.log('Entry: ',old_contract);
              new_contract.contract=old_contract.contract;
              new_contract.valid=false;
                new_arr.push(new_contract);
                
                
          } x=invalidate(new_arr);
    });
    
    
    /**return getAssetRegistry('org.acme.otc.LiveContract')
      .then(function (participantRegistry) {
          
          var factory = getFactory();
          new_arr=[];
      
          fLen = arr.__zone_symbol__value.length;
          console.log('Zone: ',arr);
          
          for (i = 0; i < fLen; i++) {
              var ISIN=arr.__zone_symbol__value[i];
                console.log('ISIN: ',ISIN);
                var new_contract = factory.newResource('org.acme.otc', 'LiveContract', ISIN);
                var entry=participantRegistry.get(ISIN);
                console.log('Entry: ',entry);
              new_contract.contract=entry.contract;
              new_contract.valid=false;
                new_arr.push(new_contract);
          }
          console.log('New Array: ', new_arr);
          return participantRegistry.updateAll(new_arr);})**/
    
    return getParticipantRegistry('org.acme.otc.Administrator')
      .then(function (participantRegistry) {
          
          var factory = getFactory();
          const entry=participantRegistry.getAll();
          var new_admin = factory.newResource('org.acme.otc', 'Administrator', sod.adminId);
          new_admin.tradingOpen=true;
          //console.log(entry);
          return participantRegistry.update(new_admin);
      })
  
    
  }  
    
    
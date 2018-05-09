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

/* global getFactory getParticipantRegistry getAssetRegistry */

/**
 * Setup the demo
 * @param {org.acme.otc.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo(setupDemo) { // eslint-disable-line no-unused-vars
    console.log('setupDemo');

    const factory = getFactory();
    const NS_M = 'org.acme.vehicle.lifecycle.manufacturer';
    const NS = 'org.acme.vehicle.lifecycle';
    const NS_D = 'org.vda';

    const trader_names = ['1','2','3','4'];
    const adminName = 'adminId:1';

    // register manufacturers
    const admin=factory.newResource('org.acme.otc', 'Administrator', adminName);
    admin.tradingOpen=false;
    
    const manufacturerRegistry = await getParticipantRegistry('org.acme.otc.Administrator');
    
    await manufacturerRegistry.add(admin);

    // register private owners
    const traders = trader_names.map(name => {
        var trader=factory.newResource('org.acme.otc', 'Trader', name);
        trader.margin=0;
        return trader;
    });
    const traderRegistry = await getParticipantRegistry('org.acme.otc.Trader');
    await traderRegistry.addAll(traders);
    /**
    // register regulator
    const regulator = factory.newResource(NS, 'Regulator', 'regulator');
    const regulatorRegistry = await getParticipantRegistry(NS + '.Regulator');
    await regulatorRegistry.add(regulator);

    // register vehicles
    const vs = [];
    let carCount = 0;
    for (const mName in vehicles) {
        const manufacturer = vehicles[mName];
        for (const mModel in manufacturer) {
            const model = manufacturer[mModel];
            for (let i = 0; i < model.length; i++) {
                const vehicleTemplate = model[i];
                const vehicle = factory.newResource(NS_D, 'Vehicle', vehicleTemplate.vin);
                vehicle.owner = factory.newRelationship(NS, 'PrivateOwner', names[carCount]);
                vehicle.vehicleStatus = vehicleTemplate.vehicleStatus;
                vehicle.vehicleDetails = factory.newConcept(NS_D, 'VehicleDetails');
                vehicle.vehicleDetails.make = mName;
                vehicle.vehicleDetails.modelType = mModel;
                vehicle.vehicleDetails.colour = vehicleTemplate.colour;
                vehicle.vehicleDetails.vin = vehicleTemplate.vin;

                if (vehicleTemplate.suspiciousMessage) {
                    vehicle.suspiciousMessage = vehicleTemplate.suspiciousMessage;
                }

                if (!vehicle.logEntries) {
                    vehicle.logEntries = [];
                }

                const logEntry = factory.newConcept(NS_D, 'VehicleTransferLogEntry');
                logEntry.vehicle = factory.newRelationship(NS_D, 'Vehicle', vehicleTemplate.vin);
                logEntry.buyer = factory.newRelationship(NS, 'PrivateOwner', names[carCount]);
                logEntry.timestamp = setupDemo.timestamp;

                vehicle.logEntries.push(logEntry);

                vs.push(vehicle);
                carCount++;
            }
        }
    }
    const vehicleRegistry = await getAssetRegistry(NS_D + '.Vehicle');
    await vehicleRegistry.addAll(vs);
    **/
}
import test from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {BUILD_COST} from '../src/city-finance.js';
import {TRADE_SEED} from '../src/trade.js';
import {formatMoney} from '../src/money.js';

test('legacy city money scales once on restore and keeps purchasing power',()=>{
 const t=new Town({mode:'managed'});t.place('home',[{x:0,z:0}],true);
 const data=t.toJSON(),scaled=structuredClone(data);
 // Simulate a pre-rescale save: city.version 1 with the old coin values.
 scaled.city.version=1;
 scaled.city.treasury=Math.round(scaled.city.treasury/150);
 scaled.city.spent=Math.round(scaled.city.spent/150);
 scaled.city.trade.funds=Math.round(scaled.city.trade.funds/150);
 scaled.city.trade.importExpense=Math.round(scaled.city.trade.importExpense/150);
 for(const e of scaled.city.ledger){e.amount=Math.round(e.amount/150);e.balance=Math.round(e.balance/150);}
 for(const e of scaled.city.trade.ledger){e.unitPrice=Math.round(e.unitPrice/150);e.tax=Math.round(e.tax/150);e.amount=Math.round(e.amount/150);e.balance=Math.round(e.balance/150);}
 const restored=Town.restore(scaled);
 assert.equal(restored.city.version,2);
 assert.equal(restored.city.treasury,data.city.treasury);
 assert.equal(restored.city.trade.funds,data.city.trade.funds);
 assert(restored.city.trade.funds<TRADE_SEED);
 // Restoring the migrated save again must not scale a second time.
 const twice=Town.restore(restored.toJSON());
 assert.equal(twice.city.treasury,data.city.treasury);
});

test('costs sit in the Song coin range and display as 貫／文',()=>{
 assert(BUILD_COST.home>=15000&&BUILD_COST.home<=20000);
 assert.equal(formatMoney(18000),'18 貫');
 assert.equal(formatMoney(2400),'2 貫 400 文');
 assert.equal(formatMoney(450),'450 文');
 assert.equal(formatMoney(-450),'−450 文');
 assert.equal(formatMoney(0),'0 文');
});

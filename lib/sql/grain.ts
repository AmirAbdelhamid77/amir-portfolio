// Deterministic mathematical trace of Module 05's illustrative fixture.
// This is not a SQL interpreter.
export const ORDERS=[{id:'O1',amount:100},{id:'O2',amount:50}] as const;
export const PAYMENTS=[{id:'P1',amount:80},{id:'P2',amount:70}] as const;
export function grainTrace(grouped:boolean){
 const orderTotal=ORDERS.reduce((s,r)=>s+r.amount,0),paymentTotal=PAYMENTS.reduce((s,r)=>s+r.amount,0);
 const rows=grouped?[{order:'Customer summary',orderAmount:orderTotal,payment:'Customer summary',paymentAmount:paymentTotal}]:ORDERS.flatMap(o=>PAYMENTS.map(p=>({order:o.id,orderAmount:o.amount,payment:p.id,paymentAmount:p.amount})));
 return {rows,orderTotal,paymentTotal,displayedOrders:rows.reduce((s,r)=>s+r.orderAmount,0),displayedPayments:rows.reduce((s,r)=>s+r.paymentAmount,0)};
}

import vault from '@/content/sql/vault.json';
import type {SqlBlock} from '@/components/sql/source';
export const SQL_PAGES=vault.pages;
export const SQL_DRILLS=vault.drills;
export const pageBlocks=(id:string)=>SQL_PAGES.find(p=>p.id===id)!.blocks as SqlBlock[];
export const SQL_QUALIFICATIONS:Record<string,string[]>={
 '02':['Dialect qualification: UNIQUE constraints and NULL handling vary by database and definition. This general explanation is not a complete cross-dialect constraint specification.'],
 '05':['The LEFT JOIN diagram is shorthand for a null-rejecting WHERE predicate such as status = Completed. A condition such as right_key IS NULL deliberately retains unmatched rows.'],
 '09':['Figure correction: the original window-frame image draws its bracket across all seven days. With day 5 current, ROWS BETWEEN 2 PRECEDING AND CURRENT ROW includes only days 3, 4 and 5: 15 + 30 + 25 = 70. The correct row membership is shown below; the original figure remains in a labelled disclosure.'],
 '10':['Correction to §1.5: in PostgreSQL, DATE minus DATE returns an integer number of days; TIMESTAMP minus TIMESTAMP returns an interval. The source wording combines these cases.','A period with no recorded event is not automatically proof of zero real activity; establish collection completeness before filling missing periods with zero.'],
 '12':['The source reports 333 rentals, 50 movies and a 7.9 mean. The MovieNow dataset is not included, so those results have not been independently reproduced. These are reported source results, not live observations.','For ROLLUP output, use GROUPING() to distinguish subtotal placeholders from genuine NULL dimension values. The source explanation assumes that distinction implicitly.'],
 '17':['Source numbering correction: the closing reference to database-design theory as Module 16 is historical. In the current canonical path Database Design is Module 15; Performance is Module 16.'],
 '3cd3906c5d6c81d5835be46fca54ec8a':['Known source-code defect: the Customers Above Segment Average example uses segment downstream but does not project or derive it in customer_spend. Establish a customer-to-segment relationship and group by customer_id and segment before using it. The original snippet is retained as evidence and must not be treated as runnable corrected SQL.'],
};

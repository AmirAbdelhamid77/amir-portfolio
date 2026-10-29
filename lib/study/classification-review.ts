// Specific corrections have priority over broad title rules. These are taxonomy
// decisions, not changes to answer keys or publication state.
export const CLASSIFICATION_REVIEW:Record<string,{topic:string;reason:string;evidence:string}>={
 'stats-formula-test-statistic':{topic:'hypothesis',reason:'A test statistic standardizes evidence under a null model; it is not the elementary definition of a statistic.',evidence:'stats-s18'},
 'stats-glossary-test-statistic':{topic:'hypothesis',reason:'The glossary entry concerns hypothesis testing and standard error.',evidence:'stats-s18'},
 'q-statistics-stat-01':{topic:'describe',reason:'The prompt asks about a right-skewed distribution and measures of center.',evidence:'stats-s4'},
 'q-statistics-stat-02':{topic:'hypothesis',reason:'The prompt asks for the interpretation of a p-value.',evidence:'stats-s19'},
 'q-statistics-stat-03':{topic:'relationships',reason:'The prompt distinguishes correlation from a causal claim.',evidence:'stats-s32'},
 'q-statistics-stat-04':{topic:'sampling',reason:'The prompt interprets a confidence interval.',evidence:'stats-s14'},
 'q-statistics-stat-05':{topic:'distributions',reason:'The prompt standardizes an observation with a mean and standard deviation.',evidence:'stats-s9'},
 'q-statistics-stat-06':{topic:'sampling',reason:'The prompt asks how to reduce sampling bias.',evidence:'stats-s12'},
 'q-statistics-stat-07':{topic:'hypothesis',reason:'The prompt concerns a Type I error.',evidence:'stats-s22'},
 'q-statistics-stat-08':{topic:'sampling',reason:'The CLT concerns the distribution of sample means, not the raw observations.',evidence:'stats-s11'},
 'q-statistics-stat-09':{topic:'describe',reason:'The prompt compares robustness of measures of center.',evidence:'stats-s4'},
 'q-statistics-stat-10':{topic:'experiments',reason:'The prompt concerns repeated significance checks in an A/B experiment.',evidence:'stats-s28'},
};
/** A storage word inside a masking/Git example must not erase the decision context. */
export function reviewedNotePlacement(pack:string,title:string){
 const focus:Record<string,string>={video06:'security',video07:'security',video08:'security',video15:'security',video09:'delivery',video10:'delivery',video12:'delivery',video21:'delivery',pipelines:'ingestion',video14:'ingestion',scd:'model',eventhouse:'streaming',video16:'query',video20:'transform'};
 if(focus[pack])return {topic:focus[pack],basis:'Content-context review: retain the source pack’s documented focal decision; incidental object vocabulary does not define the lesson topic.'};
 if(pack==='delta'||pack==='video19'){
  const topic=/shortcut|mirror|copy|ingest/i.test(title)?'ingestion':/permission|security|authorization|authentication|least.privilege/i.test(title)?'security':/sql|endpoint|query/i.test(title)?'query':/semantic|directlake|direct lake/i.test(title)?'model':/delta|vacuum|optimi|parquet|snapshot|compaction/i.test(title)?'transform':'foundations';
  return {topic,basis:'Content-context review: distinguish the named access/movement/table-state decision within the Lakehouse source.'};
 }
 return null;
}

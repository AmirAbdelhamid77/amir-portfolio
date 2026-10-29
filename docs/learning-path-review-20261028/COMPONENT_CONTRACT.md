# Component and state contract

PathUnits accepts serializable LearningUnit[] plus optional review:boolean. LearningUnit preserves stable id, sourcePointer, coverage, objective, topic/stage, reviewed prepare keys, optional declared/reviewed lessonPrerequisites, questions/applications with basis/reason, reflection/reviewPoints and source caveat. Link basis is source-explicit, reviewed-concept-match or topic-context; stronger labels never replace grading status. TopicPreparation accepts subject/topic and shows TOPIC_REVIEW evidence.

Path state is query, stage, visible limit, target hash. Initial DOM is 12 items; matching #id restores only that unit. Search/stage/reset clear target selection. Previous/next follows topologically sorted lesson order. Internal source/question/application links append learningContext, learningUnit and (only review UI) learningReview. StudyOrientation validates subject/topic/unit shape and returns to the exact path anchor. PackNotes restores the source pack and opens the exact note ID after hydration. No progress persistence writes, migration or mastery gates are introduced.

The source adapter and route keys remain canonical. Ordinary path routes: /study/[subject]/path/ for the existing eight subjects. Review-only: /study/review/path/, noindex, excluded from sitemap. No data enters Atlas publication. No new dependency, telemetry or service.

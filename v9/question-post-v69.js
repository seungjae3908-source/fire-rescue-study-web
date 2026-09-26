/* V69 precomputed question finalizer + post-generation contracts. */
'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{};V.questionById=Object.fromEntries((V.questions||[]).map(q=>[q.id,q]));V.questionsForConcept=id=>(V.questions||[]).filter(q=>q.conceptId===id);V.QuestionDifficulty?.annotate?.(V.questions||[]);V.QuestionFactory119={"version":"119-grounded-question-factory-v1","generated":769,"grade":"P","pastExamClaim":false,"sourcePolicy":"verified pack + numeric official sourceRanges only","rows":[{"id":"F01-C01","n":6,"low":1,"mid":3,"high":2},{"id":"F01-C02","n":6,"low":1,"mid":3,"high":2},{"id":"F01-C03","n":6,"low":1,"mid":3,"high":2},{"id":"F01-C04","n":6,"low":1,"mid":3,"high":2},{"id":"F01-C05","n":6,"low":1,"mid":3,"high":2},{"id":"F01-C06","n":12,"low":3,"mid":6,"high":3},{"id":"F01-C07","n":12,"low":4,"mid":5,"high":3},{"id":"F02-C01","n":6,"low":1,"mid":3,"high":2},{"id":"F02-C02","n":6,"low":1,"mid":3,"high":2},{"id":"F02-C03","n":6,"low":1,"mid":3,"high":2},{"id":"F02-C04","n":6,"low":1,"mid":3,"high":2},{"id":"F02-C05","n":6,"low":1,"mid":3,"high":2},{"id":"F02-C06","n":6,"low":1,"mid":3,"high":2},{"id":"F02-C07","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C01","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C02","n":20,"low":4,"mid":10,"high":6},{"id":"F03-C03","n":38,"low":6,"mid":21,"high":11},{"id":"F03-C04","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C05","n":7,"low":1,"mid":4,"high":2},{"id":"F03-C06","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C07","n":12,"low":2,"mid":7,"high":3},{"id":"F03-C08","n":8,"low":2,"mid":4,"high":2},{"id":"F03-C09","n":12,"low":1,"mid":5,"high":6},{"id":"F03-C10","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C11","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C12","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C13","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C14","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C15","n":6,"low":1,"mid":3,"high":2},{"id":"F03-C16","n":6,"low":1,"mid":3,"high":2},{"id":"F04-C01","n":6,"low":1,"mid":3,"high":2},{"id":"F04-C02","n":6,"low":1,"mid":3,"high":2},{"id":"F04-C03","n":6,"low":1,"mid":3,"high":2},{"id":"F04-C04","n":14,"low":3,"mid":7,"high":4},{"id":"F04-C05","n":6,"low":1,"mid":3,"high":2},{"id":"F04-C06","n":6,"low":1,"mid":3,"high":2},{"id":"F04-C07","n":6,"low":1,"mid":3,"high":2},{"id":"F04-C08","n":6,"low":1,"mid":3,"high":2},{"id":"F05-C01","n":22,"low":3,"mid":11,"high":8},{"id":"F05-C02","n":6,"low":1,"mid":3,"high":2},{"id":"F05-C03","n":6,"low":1,"mid":3,"high":2},{"id":"F05-C04","n":6,"low":1,"mid":3,"high":2},{"id":"F05-C05","n":6,"low":1,"mid":3,"high":2},{"id":"F05-C06","n":6,"low":1,"mid":3,"high":2},{"id":"F05-C07","n":6,"low":1,"mid":3,"high":2},{"id":"F05-C08","n":6,"low":1,"mid":3,"high":2},{"id":"F06-C01","n":6,"low":1,"mid":3,"high":2},{"id":"F06-C02","n":6,"low":1,"mid":3,"high":2},{"id":"F06-C03","n":6,"low":1,"mid":3,"high":2},{"id":"F06-C04","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C01","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C02","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C03","n":7,"low":1,"mid":3,"high":3},{"id":"F07-C04","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C05","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C06","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C07","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C08","n":13,"low":1,"mid":7,"high":5},{"id":"F07-C09","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C10","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C11","n":9,"low":1,"mid":6,"high":2},{"id":"F07-C12","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C13","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C14","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C15","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C16","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C17","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C18","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C19","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C20","n":6,"low":1,"mid":3,"high":2},{"id":"F07-C21","n":6,"low":1,"mid":3,"high":2},{"id":"E01-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E01-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E01-C03","n":20,"low":5,"mid":10,"high":5},{"id":"E02-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E02-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E03-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E03-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E03-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E03-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E03-C05","n":11,"low":2,"mid":5,"high":4},{"id":"E04-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E04-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E05-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E05-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E05-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E05-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E06-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E06-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E06-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E06-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E06-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E07-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E07-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E07-C03","n":13,"low":3,"mid":6,"high":4},{"id":"E07-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E07-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E08-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E08-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E08-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E08-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E08-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E08-C06","n":6,"low":1,"mid":3,"high":2},{"id":"E09-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E09-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E09-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E09-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E09-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E09-C06","n":6,"low":1,"mid":3,"high":2},{"id":"E09-C07","n":13,"low":2,"mid":7,"high":4},{"id":"E09-C08","n":6,"low":1,"mid":3,"high":2},{"id":"E10-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E10-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E10-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E10-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E10-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E11-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E11-C02","n":16,"low":3,"mid":9,"high":4},{"id":"E11-C03","n":9,"low":1,"mid":3,"high":5},{"id":"E11-C04","n":6,"low":2,"mid":3,"high":1},{"id":"E11-C05","n":10,"low":1,"mid":3,"high":6},{"id":"E11-C06","n":6,"low":1,"mid":3,"high":2},{"id":"E12-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E12-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E12-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E12-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E12-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E13-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E13-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E13-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E13-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E13-C05","n":6,"low":1,"mid":2,"high":3},{"id":"E14-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E14-C02","n":8,"low":2,"mid":4,"high":2},{"id":"E14-C03","n":19,"low":2,"mid":9,"high":8},{"id":"E15-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E15-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E15-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E16-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E16-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E16-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E16-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E17-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E17-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E17-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E17-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E18-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E18-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E19-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E19-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E19-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E19-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E19-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E20-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E20-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E20-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E20-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E20-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E20-C06","n":6,"low":1,"mid":3,"high":2},{"id":"E21-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E21-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E21-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E21-C04","n":14,"low":1,"mid":6,"high":7},{"id":"E21-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E21-C06","n":6,"low":1,"mid":3,"high":2},{"id":"E21-C07","n":6,"low":1,"mid":3,"high":2},{"id":"E21-C08","n":6,"low":1,"mid":3,"high":2},{"id":"E22-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E22-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E22-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E23-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E23-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E23-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E24-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E24-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E24-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E24-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E24-C05","n":6,"low":1,"mid":3,"high":2},{"id":"E25-C01","n":6,"low":1,"mid":3,"high":2},{"id":"E25-C02","n":6,"low":1,"mid":3,"high":2},{"id":"E25-C03","n":6,"low":1,"mid":3,"high":2},{"id":"E25-C04","n":6,"low":1,"mid":3,"high":2},{"id":"E25-C05","n":6,"low":1,"mid":3,"high":2}]};V.Quality2QuestionFactory119={"version":"119-quality2-question-factory-v2","added":1272,"targetPerConcept":12,"highYieldTarget":20,"grade":"P","pastExamClaim":false};V.QuestionExpansionV58={"version":"119-v58-precision-expansion-v1","added":2905,"examStyleTotal":5456,"totalQuestions":5566,"generalTarget":26,"highYieldTarget":40,"highYieldConcepts":49,"generatedPractice":true,"realMockCredit":false,"practiceMockCredit":true,"rows":[{"id":"F01-C01","title":"소방기관·조직체계","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F01-C02","title":"소방력","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F01-C03","title":"소방장비·소방용수시설","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F01-C04","title":"소방활동","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F01-C05","title":"의용소방대","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F01-C06","title":"소방의 발전과정","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F01-C07","title":"소방조직관리 기초이론","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F02-C01","title":"재난의 정의·유형·용어","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F02-C02","title":"재난관리주관·책임기관","subject":"fire","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"F02-C03","title":"안전관리기구","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F02-C04","title":"재난 예방","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F02-C05","title":"재난 대비·대응·복구","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F02-C06","title":"긴급구조","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F02-C07","title":"재난안전상황실·보고체계","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C01","title":"화재의 개념·유형","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C02","title":"열 발생과 전달","subject":"fire","before":20,"added":6,"after":26,"target":26,"highYield":false},{"id":"F03-C03","title":"연소반응·공기량 계산","subject":"fire","before":38,"added":0,"after":38,"target":26,"highYield":false},{"id":"F03-C04","title":"화재 진행단계","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C05","title":"화재 진행 영향요인·건축구조","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C06","title":"플래시오버·백드래프트·롤오버","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F03-C07","title":"연기·Flow Path","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C08","title":"폭발","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C09","title":"플래시오버","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F03-C10","title":"플레임오버","subject":"fire","before":20,"added":6,"after":26,"target":26,"highYield":false},{"id":"F03-C11","title":"백드래프트","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F03-C12","title":"보일오버","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C13","title":"슬롭오버","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C14","title":"프로스오버","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C15","title":"BLEVE·파이어볼","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F03-C16","title":"풀파이어","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F04-C01","title":"소화원리","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F04-C02","title":"소화약제 조건·분류","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F04-C03","title":"물 소화약제","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F04-C04","title":"포 소화약제","subject":"fire","before":14,"added":12,"after":26,"target":26,"highYield":false},{"id":"F04-C05","title":"이산화탄소 소화약제","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F04-C06","title":"할로겐화합물 소화약제","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F04-C07","title":"할로겐화합물·불활성기체","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F04-C08","title":"분말 소화약제","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F05-C01","title":"위험물 정의·류별 분류·특수가연물","subject":"fire","before":22,"added":18,"after":40,"target":40,"highYield":true},{"id":"F05-C02","title":"제1류 산화성고체","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F05-C03","title":"제2류 가연성고체","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F05-C04","title":"제3류 자연발화성·금수성물질","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F05-C05","title":"제4류 인화성액체","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F05-C06","title":"제5류 자기반응성물질","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F05-C07","title":"제6류 산화성액체","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F05-C08","title":"위험물화재 특수현상·소화원칙","subject":"fire","before":19,"added":21,"after":40,"target":40,"highYield":true},{"id":"F06-C01","title":"화재조사의 목적·기본원칙","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F06-C02","title":"현장보존·조사절차","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F06-C03","title":"발화부·발화원인 조사","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F06-C04","title":"화재피해 조사·기록","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C01","title":"소방시설 5분류·건축방재","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C02","title":"소화기구","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C03","title":"옥내소화전설비","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C04","title":"옥외소화전설비","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C05","title":"스프링클러설비","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C06","title":"간이스프링클러·화재조기진압용 스프링클러","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C07","title":"물분무·미분무소화설비","subject":"fire","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"F07-C08","title":"포소화설비","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C09","title":"이산화탄소·가스계소화설비","subject":"fire","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"F07-C10","title":"분말소화설비","subject":"fire","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"F07-C11","title":"자동화재탐지설비","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C12","title":"비상경보·비상방송·자동화재속보·가스/누전경보","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C13","title":"피난구조설비","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C14","title":"소화용수설비","subject":"fire","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"F07-C15","title":"소화활동설비·제연·연결송수","subject":"fire","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"F07-C16","title":"스프링클러 구성요소","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C17","title":"습식 스프링클러","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C18","title":"건식 스프링클러","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C19","title":"준비작동식 스프링클러","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C20","title":"일제살수식 스프링클러","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"F07-C21","title":"스프링클러 헤드·감열부","subject":"fire","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E01-C01","title":"응급의료서비스 체계","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E01-C02","title":"선진국 응급의료서비스 체계","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E01-C03","title":"응급구조사 법적책임·119구급대 법령","subject":"ems","before":20,"added":6,"after":26,"target":26,"highYield":false},{"id":"E02-C01","title":"응급처치 시 정신적 스트레스","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E02-C02","title":"개인 안전","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E03-C01","title":"감염예방의 정의","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E03-C02","title":"감염예방 처치","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E03-C03","title":"소독과 멸균","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E03-C04","title":"감염 관리·패혈증 주의","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E03-C05","title":"위험물·CBRN 현장 구급·제독","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E04-C01","title":"인체 기본 해부학","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E04-C02","title":"인체 해부생리학","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E05-C01","title":"의사소통","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E05-C02","title":"통신 체계","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E05-C03","title":"무선통신","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E05-C04","title":"기록지·중증도 분류","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E06-C01","title":"이동 전 계획","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E06-C02","title":"신체 역학","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E06-C03","title":"환자 안전","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E06-C04","title":"환자 이동 장비","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E06-C05","title":"환자 자세","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E07-C01","title":"기도확보유지 장비","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E07-C02","title":"호흡유지 장비","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E07-C03","title":"순환유지 장비·수액 주입 계산","subject":"ems","before":13,"added":27,"after":40,"target":40,"highYield":true},{"id":"E07-C04","title":"환자이송 장비","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E07-C05","title":"외상처치 장비","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E08-C01","title":"현장 확인","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E08-C02","title":"1차 평가","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E08-C03","title":"2차 평가","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E08-C04","title":"비외상 주요 병력·신체검진","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E08-C05","title":"외상 주요 병력·신체검진","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E08-C06","title":"재평가","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E09-C01","title":"기도유지의 중요성","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E09-C02","title":"호흡","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E09-C03","title":"기도확보","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E09-C04","title":"기도유지 보조기구","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E09-C05","title":"인공호흡방법","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E09-C06","title":"흡인과 흡인기","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E09-C07","title":"산소 치료","subject":"ems","before":13,"added":27,"after":40,"target":40,"highYield":true},{"id":"E09-C08","title":"특수한 상황","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E10-C01","title":"호흡기계 해부·생리","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E10-C02","title":"정상·비정상호흡","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E10-C03","title":"호흡곤란","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E10-C04","title":"신생아와 소아","subject":"ems","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"E10-C05","title":"연기 흡입","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E11-C01","title":"심혈관계 해부·생리","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E11-C02","title":"심질환·심전도 리듬","subject":"ems","before":16,"added":10,"after":26,"target":26,"highYield":false},{"id":"E11-C03","title":"심장마비","subject":"ems","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"E11-C04","title":"제세동","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E11-C05","title":"심장충격기","subject":"ems","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"E11-C06","title":"자동 체외 심장충격기","subject":"ems","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"E12-C01","title":"배의 해부·생리","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E12-C02","title":"복통","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E12-C03","title":"환자 평가","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E12-C04","title":"환자 처치","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E12-C05","title":"복통유발 질병","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E13-C01","title":"순환계","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E13-C02","title":"출혈","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E13-C03","title":"외부 출혈","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E13-C04","title":"내부 출혈","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E13-C05","title":"저혈량 쇼크","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E14-C01","title":"피부의 기능과 구조","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E14-C02","title":"연부조직 손상","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E14-C03","title":"화상","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E15-C01","title":"근골격계 해부·생리","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E15-C02","title":"외상과 근골격계","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E15-C03","title":"부목","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E16-C01","title":"머리·척추·중추신경계 해부","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E16-C02","title":"척추 손상","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E16-C03","title":"머리 손상","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E16-C04","title":"헬멧 제거","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E17-C01","title":"의식 장애","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E17-C02","title":"당뇨와 의식장애","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E17-C03","title":"경련","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E17-C04","title":"뇌졸중","subject":"ems","before":20,"added":6,"after":26,"target":26,"highYield":false},{"id":"E18-C01","title":"중독","subject":"ems","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"E18-C02","title":"알레르기 반응","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E19-C01","title":"체온조절과 신체","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E19-C02","title":"한랭손상","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E19-C03","title":"열 손상","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E19-C04","title":"익수 사고","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E19-C05","title":"물림과 쏘임","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E20-C01","title":"임신 해부·생리","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E20-C02","title":"분만","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E20-C03","title":"정상분만·신생아 초기처치","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E20-C04","title":"분만 합병증","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E20-C05","title":"임신 중 응급상황·처치","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E20-C06","title":"부인과 응급","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E21-C01","title":"소아 응급처치의 정의","subject":"ems","before":12,"added":28,"after":40,"target":40,"highYield":true},{"id":"E21-C02","title":"해부와 생리","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E21-C03","title":"발달 과정","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E21-C04","title":"기도·호흡·소아소생 기초","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E21-C05","title":"평가","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E21-C06","title":"일반 내과 문제","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E21-C07","title":"외상","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E21-C08","title":"아동 학대와 방임","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E22-C01","title":"노인의 해부와 생리","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E22-C02","title":"노인환자 접근","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E22-C03","title":"평가","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E23-C01","title":"행동 응급","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E23-C02","title":"특수한 상황","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E23-C03","title":"기록","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E24-C01","title":"기본소생술 개요","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E24-C02","title":"기도유지·인공호흡","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E24-C03","title":"가슴압박","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E24-C04","title":"심폐소생술","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E24-C05","title":"기도 내 이물질 제거","subject":"ems","before":20,"added":20,"after":40,"target":40,"highYield":true},{"id":"E25-C01","title":"간·담도·췌장 응급","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E25-C02","title":"비뇨생식기계 응급","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E25-C03","title":"조혈계 응급","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E25-C04","title":"눈·귀·코·목 응급","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false},{"id":"E25-C05","title":"비외상성 근골격계 응급","subject":"ems","before":12,"added":14,"after":26,"target":26,"highYield":false}]};V.PrecomputedQuestionFactoriesV69={version:'119-v69-precomputed-factories-v1',count:4946,factory:769,quality2:1272,v58:2905,runtimeGeneration:false};})();
/* --- textbook-grounded-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!V.curriculum?.concepts||!V.contentPacks?.authored)return;

const TARGET=900;
const chars=x=>String(x||'').replace(/\s+/g,'').length;
const clip=(x,n=180)=>{const s=String(x||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
const norm=x=>String(x||'').replace(/\s+/g,' ').trim().toLowerCase();
const unique=list=>{const seen=new Set(),out=[];for(const x of list){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(x)}return out};
const textOf=p=>[p.summary,...(p.detail||[]),...(p.deepSections||[]).flatMap(s=>[s.title,s.body,...(s.bullets||[])])].join(' ');
const numericGrounded=c=>(c.sourceRanges||[]).length>0&&(c.sourceRanges||[]).every(r=>r.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));
const officialWebLinks=p=>(p?.officialLinks||[]).filter(x=>/^https:\/\/([a-z0-9-]+\.)*go\.kr\//i.test(String(x?.url||'')));
const officialWebGrounded=p=>officialWebLinks(p).length>0;
const grounded=(c,p)=>numericGrounded(c)||officialWebGrounded(p);
const sourcePages=c=>(c.sourceRanges||[]).map(r=>`${r.label||r.doc} ${Number(r.from)===Number(r.to)?Number(r.from):Number(r.from)+'~'+Number(r.to)}쪽`).join(' · ');
const sourceAnchor=(c,p)=>{
  const pages=sourcePages(c);if(pages)return pages;
  const web=officialWebLinks(p).map(x=>String(x.label||x.url||'').trim()).filter(Boolean).join(' · ');
  return web||String(p?.source||'공식 근거').trim()
};
const section=(title,body,bullets=[])=>({title,body,bullets});

function ensureMemory(c,p,base){
  p.must=unique([...(p.must||[])]);
  const candidates=[
    base.summary&&`핵심 정의: ${clip(base.summary,120)}`,
    base.detail[0]&&`세부 연결: ${clip(base.detail[0],120)}`,
    base.detail[1]&&`추가 포인트: ${clip(base.detail[1],120)}`,
    base.deepBodies[0]&&`심화 포인트: ${clip(base.deepBodies[0],120)}`
  ].filter(Boolean);
  for(const x of candidates){if(p.must.length>=3)break;p.must=unique([...p.must,x])}
}
function ensureTraps(c,p,base){
  p.traps=unique([...(p.traps||[])]);
  const must=p.must||[],cmp=base.compare;
  const candidates=[];
  if(cmp.length>=2)candidates.push(`‘${clip(cmp[0][0],55)}’과 ‘${clip(cmp[1][0],55)}’을 같은 개념으로 처리하지 않는다.`);
  if(must.length>=2)candidates.push(`‘${clip(must[0],80)}’만 보고 ‘${clip(must[1],80)}’을 생략하는 단순화에 주의한다.`);
  if(base.detail[0])candidates.push(`다음 공식 설명의 조건을 반대로 해석하지 않는다: ${clip(base.detail[0],115)}`);
  candidates.push(`${c.title} 문제에서 공식 근거에 없는 수치·예외·조건을 임의로 덧붙인 선지를 경계한다.`);
  for(const x of candidates){if(p.traps.length>=2)break;p.traps=unique([...p.traps,x])}
}
function ensureSpecialComparisons(c,p){
  if(c.id==='F05-C01'&&(p.compare||[]).length<2){
    p.compare=[
      ['1·6류','산화성 물질: 다른 물질의 연소를 촉진하는 성격을 중심으로 구분'],
      ['2·4류','가연성고체와 인화성액체: 가연성의 형태와 화재성상을 구분'],
      ['3·5류','자연발화성·금수성과 자기반응성: 반응을 일으키는 조건과 위험성을 분리']
    ];
  }
  if(c.id==='F05-C08'&&(p.compare||[]).length<2){
    p.compare=[
      ['특수현상 판단','탱크 내부 열전달·수분층·분출 등 현상 자체의 발생조건과 징후를 확인'],
      ['소화원칙 판단','물질 식별·용기/누출 상태·물과의 반응성·적합 약제를 순서대로 확인']
    ];
  }
  if(c.id==='F07-C05'&&(p.compare||[]).length<2){
    p.compare=[
      ['스프링클러 헤드','화재열을 직접 받아 감열부가 작동하고 해당 헤드에서 방수'],
      ['자동화재탐지 감지기','열·연기 등 화재징후를 검출해 수신기와 경보계통으로 신호 전달']
    ];
  }
}
function candidateSections(c,p,base){
  const must=p.must||[],traps=p.traps||[],cmp=p.compare||[],details=base.detail;
  const qs=V.QuestionQuality119?.forConcept?.(c.id)||[];
  const typeNames=unique(qs.map(q=>q.type).filter(Boolean)).slice(0,4);
  const diff={low:0,mid:0,high:0};for(const q of qs)if(diff[q.difficulty]!==undefined)diff[q.difficulty]++;
  const subjectFrame=c.subject==='ems'
    ?'응급처치 개념은 현장안전, 평가, 처치, 재평가 중 어느 판단단계와 연결되는지 확인하면서 읽으면 단순 암기보다 적용력이 높아진다.'
    :'소방학 개념은 정의·원리·작동흐름·적용대상·예외를 분리해 읽고, 서로 다른 설비나 현상의 조건을 섞지 않는 것이 핵심이다.';
  const rows=[];
  rows.push(section('개념 구조와 읽는 순서',
    `‘${c.title}’의 기준문장은 “${clip(base.summary,210)}”이다. 이 문장을 단독 암기하지 말고 세부 설명과 함께 읽는다. ${subjectFrame} 연결된 공식 원문 근거에서 확인된 설명만을 기준으로 하고, 표현이 비슷하더라도 전제조건이 다른 내용을 같은 규칙으로 일반화하지 않는다.`,
    details.slice(0,3).map((x,i)=>`세부 ${i+1}: ${clip(x,170)}`)));
  rows.push(section('핵심 포인트 연결',
    `이 학습노드의 기억축은 ${must.slice(0,4).map(x=>'‘'+clip(x,90)+'’').join(' / ')}이다. 각 항목은 따로 외우기보다 하나의 답안 구조로 묶는다. 문제에서 일부 핵심만 맞고 나머지 조건이 빠졌다면 정답 여부를 다시 확인하고, 공식 설명의 범위를 벗어난 과도한 확대해석을 피한다.`,
    must.slice(0,5)));
  rows.push(section('혼동 제거와 오답 판별',
    `오답은 핵심어 하나를 맞춘 뒤 조건을 바꾸거나, 인접 개념의 특징을 섞는 방식으로 만들어지기 쉽다. 이 노드에서는 ${traps.slice(0,3).map(x=>'‘'+clip(x,110)+'’').join(' / ')}를 우선 경계한다. 정답을 고를 때는 선지 전체가 공식 근거와 일치하는지 보고 부분적으로 맞는 문장에 끌리지 않는다.`,
    traps.slice(0,4)));
  if(cmp.length){
    rows.push(section('비교·구분 프레임',
      `비교가 필요한 경우 이름보다 구분축을 먼저 잡는다. 현재 교재 pack에서 직접 연결된 비교축은 ${cmp.slice(0,4).map(r=>'‘'+clip(r[0],60)+' ↔ '+clip(r[1],110)+'’').join(' / ')}이다. 시험에서는 한쪽 특징을 다른 쪽에 옮겨 붙인 선지와 공통점·차이점을 뒤바꾼 표현을 확인한다.`,
      cmp.slice(0,4).map(r=>`${r[0]}: ${r[1]}`)));
  }
  rows.push(section('문제 적용과 난이도 대응',
    `이 개념에는 현재 근거가 연결된 시험형 연습문제가 ${qs.length}개 있으며 난이도 분포는 하 ${diff.low}·중 ${diff.mid}·상 ${diff.high}이다. ${typeNames.length?'문항 유형은 '+typeNames.join('·')+' 중심으로 구성되어 있다. ':''}하 난이도에서는 정의와 직접회상을, 중에서는 비교·상황판단을, 상에서는 예외·복합조합을 확인하되 모든 판단의 출발점은 같은 공식 근거다.`,
    qs.slice(0,3).map(q=>`${q.difficulty||'mid'} · ${q.type||'문제'}: ${clip(q.q,150)}`)));
  rows.push(section('공식 원문으로 복귀하는 기준',
    `${c.title}의 근거는 ${sourceAnchor(c,p)}에 연결되어 있다. 암기한 표현이 애매하거나 수치·예외·적용조건이 문제에 등장하면 기억에 의존해 보정하지 말고 연결된 공식 원문으로 되돌아가 확인한다. 이 교재의 요약·문제·함정표시는 원문을 대신하는 새로운 규칙이 아니라 원문의 학습동선을 빠르게 재구성한 것이다.`,
    [`근거: ${sourceAnchor(c,p)}`,`현재 상태: ${p.status}`,`원문 확인 우선: 수치·예외·적용조건`]));
  rows.push(section('회상 루프',
    `복습할 때는 ① 제목을 보고 기준문장을 말한다 ② 반드시 기억할 항목을 최소 세 개 회상한다 ③ 혼동 주의를 두 개 이상 설명한다 ④ 비교표가 있으면 차이를 말한다 ⑤ 마지막으로 원문 페이지를 확인한다. 이 순서를 반복하면 단순 문장 암기보다 개념의 경계와 적용조건을 함께 회상할 수 있다.`,
    [...must.slice(0,3).map(x=>`기억: ${x}`),...traps.slice(0,2).map(x=>`주의: ${x}`)]));
  return rows;
}

let enriched=0,depthClosed=0,sectionsClosed=0,trapsClosed=0,memoryClosed=0;
for(const c of V.curriculum.concepts){
  const p=V.contentPacks.authored[c.id];if(!p||p.status!=='verified'||!grounded(c,p))throw new Error('TEXTBOOK_GROUNDED_SOURCE_REQUIRED '+c.id);
  const before={depth:chars(textOf(p))>=TARGET,sections:(p.deepSections||[]).length>=4,traps:(p.traps||[]).length>=2,memory:(p.must||[]).length>=3};
  const base={
    summary:String(p.summary||''),detail:[...(p.detail||[])],
    deepBodies:(p.deepSections||[]).map(x=>x.body).filter(Boolean),
    compare:[...(p.compare||[])]
  };
  ensureMemory(c,p,base);
  ensureTraps(c,p,base);
  ensureSpecialComparisons(c,p);
  p.deepSections=[...(p.deepSections||[])];
  const existingTitles=new Set(p.deepSections.map(x=>norm(x.title)));
  const candidates=candidateSections(c,p,base);
  let changed=false;
  for(const s of candidates){
    const needDepth=chars(textOf(p))<TARGET,needSections=p.deepSections.length<4;
    if(!needDepth&&!needSections)break;
    if(existingTitles.has(norm(s.title)))continue;
    p.deepSections.push(s);existingTitles.add(norm(s.title));changed=true;
  }
  if(chars(textOf(p))<TARGET)throw new Error('TEXTBOOK_GROUNDED_DEPTH_SHORT '+c.id+' chars='+chars(textOf(p)));
  if(p.deepSections.length<4)throw new Error('TEXTBOOK_GROUNDED_SECTIONS_SHORT '+c.id);
  if((p.must||[]).length<3)throw new Error('TEXTBOOK_GROUNDED_MEMORY_SHORT '+c.id);
  if((p.traps||[]).length<2)throw new Error('TEXTBOOK_GROUNDED_TRAPS_SHORT '+c.id);
  if(changed||!before.memory||!before.traps)enriched++;
  if(!before.depth)depthClosed++;
  if(!before.sections)sectionsClosed++;
  if(!before.traps)trapsClosed++;
  if(!before.memory)memoryClosed++;
  p.textbookGrounded119=true;
}
V.TextbookGrounded119={
  version:'119-grounded-textbook-v1',
  targetChars:TARGET,enriched,depthClosed,sectionsClosed,trapsClosed,memoryClosed,
  sourcePolicy:'verified content pack + numeric official sourceRanges OR verified official go.kr web anchor; no invented page claims'
};
V.Quality2StudySchema119?.refreshAll?.();
})();
;
;

/* --- coverage-map-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const T=(id,subject,group,title,status,refs=[],meta={})=>({id,subject,group,title,status,refs,...meta});
const topics=[
  // FIRE — organization / disaster
  T('F-ORG-01','fire','소방행정','소방조직·기관·변천','covered',['F01-C01']),
  T('F-ORG-02','fire','소방행정','소방력·인력·장비·용수','covered',['F01-C02','F01-C03']),
  T('F-ORG-03','fire','소방행정','소방활동·현장권한·의용소방대','covered',['F01-C04','F01-C05']),
  T('F-DIS-01','fire','재난관리','재난 정의·유형·관리체계','covered',['F02-C01','F02-C02','F02-C03']),
  T('F-DIS-02','fire','재난관리','예방·대비·대응·복구','covered',['F02-C04','F02-C05']),
  T('F-DIS-03','fire','재난관리','긴급구조·현장지휘·상황실·보고','covered',['F02-C06','F02-C07'],{recent:'high'}),

  // FIRE — science / combustion / fire dynamics
  T('F-SCI-01','fire','소방과학','원자·분자·원자량·분자량','covered',['F03-C03'],{calc:true,evidence:'2026-NFA-molecule+ScienceAll-atomic-molecular-mass'}),
  T('F-SCI-02','fire','소방과학','화학결합·화학반응식·산화환원','covered',['F03-C03'],{calc:true,evidence:'2026-fire1-12-16+fire2-191-299'}),
  T('F-SCI-03','fire','소방과학','물질상태·상변화·감열·잠열','covered',['F03-C02'],{calc:true,evidence:'2026-fire1-9+fire2-190+309+345'}),
  T('F-SCI-04','fire','소방과학','기체법칙·이상기체·mol','covered',['F03-C03'],{calc:true,recent:'2026',evidence:'2026-NFA-mol+KOSHA-Boyle-Charles+ScienceAll-ideal-gas'}),
  T('F-SCI-05','fire','소방과학','열량·비열·열용량 계산','covered',['F03-C02'],{calc:true,evidence:'2026-NFA-fire2-190+ScienceAll-specific-heat-capacity'}),
  T('F-SCI-06','fire','소방과학','전도·대류·복사와 복사열 계산','covered',['F03-C02'],{calc:true,recent:'2026',evidence:'2026-NFA-heat-transfer+KOSHA-Stefan-Boltzmann'}),
  T('F-COMB-01','fire','연소이론','연소 4요소·연소형태·완전/불완전연소','covered',['F03-C03']),
  T('F-COMB-02','fire','연소이론','이론산소량·이론공기량·연소반응식 계산','covered',['F03-C03'],{calc:true,evidence:'2026-fire2-299-302'}),
  T('F-COMB-03','fire','연소이론','인화점·연소점·발화점','covered',['F03-C03'],{evidence:'2026-fire2-303-306'}),
  T('F-COMB-04','fire','연소이론','자연발화·축열·최소점화에너지','covered',['F03-C03'],{evidence:'2026-fire2-295-316'}),
  T('F-COMB-05','fire','연소이론','연소하한·상한·폭발범위·온도/압력 영향','covered',['F03-C03'],{calc:true,evidence:'2026-fire2-306-307'}),
  T('F-COMB-06','fire','연소이론','최소산소농도(MOC)','covered',['F04-C06'],{calc:true,recent:'2026',evidence:'2026-fire2-226'}),
  T('F-COMB-07','fire','연소이론','연소생성물·CO·CO2·HCN·연기독성','covered',['F03-C03','F03-C07'],{evidence:'2026-fire2-299+330-334'}),
  T('F-FIRE-01','fire','화재이론','화재의 정의·유형·성장단계','covered',['F03-C01','F03-C04']),
  T('F-FIRE-02','fire','화재이론','화재 진행 영향요인·구획화재','covered',['F03-C05']),
  T('F-FIRE-03','fire','화재이론','중성대·압력차·개구부 영향','covered',['F03-C07'],{recent:'2026',evidence:'2026-fire1-middle-plane'}),
  T('F-FIRE-04','fire','화재이론','연료지배·환기지배·Flow Path','covered',['F03-C05','F03-C07'],{evidence:'2026-fire1-18+22+33-34'}),
  T('F-FIRE-05','fire','화재이론','연기층·플룸·천장제트·가시거리','covered',['F03-C07'],{evidence:'2026-fire1-18+fire2-325+338'}),
  T('F-FIRE-06','fire','화재이론','플래시오버·롤오버·백드래프트 비교','covered',['F03-C09','F03-C10','F03-C11'],{recent:'high'}),
  T('F-FIRE-07','fire','특수화재','보일오버·슬롭오버·프로스오버','covered',['F03-C12','F03-C13','F03-C14']),
  T('F-FIRE-08','fire','특수화재','BLEVE·파이어볼·풀파이어·제트파이어','covered',['F03-C15','F03-C16'],{evidence:'2026-fire2-354-357+KOSHA-pool-jet-fire'}),
  T('F-EXP-01','fire','폭발','폭연·폭굉','covered',['F03-C08'],{evidence:'2026-fire2-explosion'}),
  T('F-EXP-02','fire','폭발','분진폭발·가스폭발·분해폭발','covered',['F03-C08'],{evidence:'2026-fire2-340+342-348'}),
  T('F-EXP-03','fire','폭발','증기운폭발(VCE)·폭발방호','covered',['F03-C08'],{evidence:'2026-fire2-354-357+KOSHA-explosion-prevention-overpressure-protection'}),
  T('F-BLD-01','fire','건축화재·방재','목조건축물 vs 내화건축물 화재','covered',['F03-C05'],{recent:'2024',evidence:'2026-fire1-30-90'}),
  T('F-BLD-02','fire','건축화재·방재','방화구획·방화벽·방화문','covered',['F07-C01'],{recent:'2026',evidence:'building-act-46-57'}),
  T('F-BLD-03','fire','건축화재·방재','불연·준불연·난연재료·내화구조','covered',['F07-C01'],{recent:'2026',evidence:'building-act-2'}),
  T('F-BLD-04','fire','건축화재·방재','연돌효과·연기이동·피난계획','covered',['F03-C07'],{recent:'2024',evidence:'2026-fire2-335-338+fire1-77'}),
  T('F-BLD-05','fire','특수화재','주방·전기·가스·금속화재','covered',['F03-C01'],{recent:'2026',evidence:'2026-fire1-4+37-38+fire2-188+197'}),

  // FIRE — suppression / hazardous materials / facilities / investigation
  T('F-SUP-01','fire','소화이론','냉각·질식·제거·억제 소화','covered',['F04-C01']),
  T('F-SUP-02','fire','소화약제','물·포·CO2·할론·청정·분말 비교','covered',['F04-C02','F04-C03','F04-C04','F04-C05','F04-C06','F04-C07','F04-C08']),
  T('F-SUP-03','fire','소화약제','포 혼합농도·팽창비·원액량 계산','covered',['F04-C04'],{calc:true,evidence:'2026-fire1-36+fire2-199-204+206+210'}),
  T('F-HAZ-01','fire','위험물','위험물 정의·류별 성상·품명·지정수량','covered',['F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07']),
  T('F-HAZ-02','fire','위험물','지정수량 배수·혼재위험물 계산','covered',['F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07'],{calc:true}),
  T('F-HAZ-03','fire','위험물','류별 저장·취급금기·소화·예외','covered',['F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07'],{evidence:'NFA-hazmat-common-storage-extinguishing-exceptions'}),
  T('F-HAZ-04','fire','위험물','특수가연물','covered',['F05-C01'],{recent:'2026'}),
  T('F-FAC-01','fire','소방시설','소방시설 5분류·소화기구·소화전','covered',['F07-C01','F07-C02','F07-C03','F07-C04']),
  T('F-FAC-02','fire','소방시설','스프링클러 구성·습식·건식·준비작동·일제살수','covered',['F07-C05','F07-C16','F07-C17','F07-C18','F07-C19','F07-C20','F07-C21']),
  T('F-FAC-03','fire','소방시설','간이·ESFR·물분무·미분무·포·가스·분말','covered',['F07-C06','F07-C07','F07-C08','F07-C09','F07-C10']),
  T('F-FAC-04','fire','소방시설','감지기·자동화재탐지·경보설비 작동논리','covered',['F07-C11','F07-C12'],{evidence:'2026-prevention1-detection-alarm-flow'}),
  T('F-FAC-05','fire','소방시설','피난구조·소화용수·제연·연결송수·무선통신보조','covered',['F07-C13','F07-C14','F07-C15'],{evidence:'2026-prevention1-evac-water-smoke-standpipe-radio'}),
  T('F-INV-01','fire','화재조사','목적·현장보존·발화부·원인·피해조사','covered',['F06-C01','F06-C02','F06-C03','F06-C04'],{recent:'2025'}),

  // EMS — general / law / disaster
  T('E-GEN-01','ems','총론','응급의료체계·응급구조사 법적책임','covered',['E01-C01','E01-C02','E01-C03']),
  T('E-LAW-01','ems','법령','119구조·구급법·시행령','covered',['E01-C03'],{recent:'2026',evidence:'current-119-act+decree+rule-2026'}),
  T('E-LAW-02','ems','법령','응급의료법·시행규칙·1급 업무범위','covered',['E01-C03'],{recent:'2026',evidence:'Emergency-Medical-Service-Act-36-41+Rule-Annex14-current'}),
  T('E-LAW-03','ems','법령','의료지도·동의·기록·비밀유지·윤리','covered',['E01-C03','E05-C04'],{evidence:'EMS-Act-9-40-49-52+119-Rule-12-18-current'}),
  T('E-TRN-01','ems','이송','구급차 운용·장비·병원선정','covered',['E06-C01','E06-C04','E07-C04'],{evidence:'2026-NFA-EMS-89-102+103-126+current-119-act-10-3+decree-12'}),
  T('E-TRN-02','ems','이송','항공이송·국제구급','covered',['E01-C03'],{recent:'2026',evidence:'current-119-act-10-4+12+decree-13-3'}),
  T('E-MCI-01','ems','재난의료','대량재난·START 분류','covered',['E05-C04'],{recent:'2024',evidence:'2026-NFA-EMS-85-87-START-RPM'}),
  T('E-MCI-02','ems','재난의료','재난통신·지휘체계·특수재난·CBRN·제독','covered',['E03-C05'],{recent:'2024',evidence:'2026-NFA-EMS-44-50+72-84+NFSA-CBRNE+SafeKorea-CBRN'}),
  T('E-SAFE-01','ems','총론','대원안전·스트레스·감염·PPE','covered',['E02-C01','E02-C02','E03-C01','E03-C02','E03-C03','E03-C04','E03-C05']),
  T('E-ASS-01','ems','환자평가','현장확인·1차·2차·SAMPLE·재평가','covered',['E08-C01','E08-C02','E08-C03','E08-C04','E08-C05','E08-C06']),
  T('E-AIR-01','ems','기도·호흡','기도개방·보조기구·흡인·산소·환기','covered',['E09-C01','E09-C02','E09-C03','E09-C04','E09-C05','E09-C06','E09-C07','E09-C08']),
  T('E-RESP-01','ems','기도·호흡','호흡곤란·천식·COPD·흡입손상','covered',['E10-C01','E10-C02','E10-C03','E10-C04','E10-C05'],{evidence:'2026-NFA-EMS-192-198'}),
  T('E-BLS-01','ems','소생술','성인·소아·영아 BLS·기도이물','covered',['E24-C01','E24-C02','E24-C03','E24-C04','E24-C05']),

  // EMS — ACLS / ECG
  T('E-ACLS-01','ems','전문심장소생술','심정지 알고리즘·shockable/non-shockable','covered',['E11-C03','E11-C04','E11-C05'],{recent:'very-high',evidence:'2020-KACPR-140-145-2026-exam-standard'}),
  T('E-ECG-01','ems','전문심장소생술','VF·무맥성 VT·PEA·asystole 판독','covered',['E11-C04','E11-C05'],{visual:true,recent:'very-high',evidence:'2020-KACPR-140-145+2026-NFA-EMS-208-209+study-waveform-schematic'}),
  T('E-ECG-02','ems','전문심장소생술','SVT·AF·VT·서맥·AV block 판독','covered',['E11-C02','E11-C05'],{visual:true,recent:'very-high',evidence:'2026-NFA-EMS-3lead+2020-KACPR-SVT-VT-brady+2024-KHRS-AF+Korean-AV-block-reference'}),
  T('E-ACLS-02','ems','전문심장소생술','안정/불안정 빈맥·서맥 알고리즘','covered',['E11-C02'],{recent:'very-high',evidence:'2020-KACPR-pediatric-brady-tachy-tables+2026-NFA-EMS-rhythm-hemodynamic-assessment'}),
  T('E-ACLS-03','ems','전문심장소생술','제세동·동기화 심율동전환·경피조율','covered',['E11-C04','E11-C05','E11-C06'],{visual:true,recent:'very-high',evidence:'2020-KACPR-adult-ALS-140-145+pediatric-table8-table9+2026-NFA-EMS-210-215'}),
  T('E-ACLS-04','ems','전문심장소생술','에피네프린·아미오다론·아데노신·아트로핀 등 약물','covered',['E11-C03','E11-C05'],{recent:'very-high'}),
  T('E-ACLS-05','ems','전문심장소생술','Hs & Ts·ROSC 후 처치','covered',['E11-C03'],{evidence:'2020-KACPR-144-145+235-257-2026-exam-standard'}),
  T('E-CARD-01','ems','내과응급','ACS·STEMI/NSTEMI·급성폐부종·심인성쇼크','covered',['E11-C01','E11-C02'],{visual:true,evidence:'2026-NFA-EMS-200-205+487-505+KDCA-AMI+KDCA-pulmonary-edema+KDCA-cardiogenic-shock'}),

  // EMS — trauma / medical / special
  T('E-SHOCK-01','ems','쇼크','저혈량·심인성·폐쇄성·분포성 쇼크 비교','covered',['E13-C01','E13-C02','E13-C03','E13-C04','E13-C05'],{evidence:'2026-NFA-EMS-hypovolemic+KDCA-hypotension-cardiogenic+KDCA-PE-pneumothorax+KDCA-sepsis-anaphylaxis+2020-KACPR-5H5T'}),
  T('E-TRM-01','ems','외상','손상기전·연부조직·근골격·머리·척추','covered',['E14-C01','E14-C02','E15-C01','E15-C02','E15-C03','E16-C01','E16-C02','E16-C03','E16-C04']),
  T('E-TRM-02','ems','외상','흉부외상: 긴장기흉·혈흉·심장압전·연가양흉','covered',['E14-C02'],{recent:'high',evidence:'2026-NFA-EMS-flail-chest+KDCA-pneumothorax+KDCA-cardiac-tamponade+KDCA-2026-traumatic-hemothorax'}),
  T('E-TRM-03','ems','외상','복부·골반외상·대량출혈·중증외상 이송','covered',['E13-C04','E13-C05','E14-C02'],{recent:'2026',evidence:'2026-NFA-EMS-250-251+471-473+485'}),
  T('E-BURN-01','ems','외상','화상 깊이·TBSA·특수화상','covered',['E14-C03'],{evidence:'2026-NFA-EMS-255-265'}),
  T('E-BURN-02','ems','계산','Parkland 수액량 계산','covered',['E14-C03'],{calc:true,recent:'2025'}),
  T('E-CALC-01','ems','계산','산소통 사용시간 계산','covered',['E09-C07'],{calc:true,evidence:'2026-NFA-EMS-185-186+NFA-official-education-Q496'}),
  T('E-CALC-02','ems','계산','수액 적하속도·시간당 주입량','covered',['E07-C03'],{calc:true,evidence:'MFDS-IV-set-guide+certified-IV-set-drop-factor+dimensional-arithmetic'}),
  T('E-NEURO-01','ems','내과응급','의식장애·경련·뇌졸중','covered',['E17-C01','E17-C02','E17-C03','E17-C04']),
  T('E-ENDO-01','ems','내과응급','저혈당·DKA·HHS','covered',['E17-C02'],{recent:'2025',evidence:'KDCA-hypoglycemia+diabetes-acute-complications+hyperglycemia-current'}),
  T('E-GI-01','ems','내과응급','급성복통·위장관 출혈·복부 응급','covered',['E12-C01','E12-C02','E12-C03','E12-C04','E12-C05'],{evidence:'2026-NFA-EMS-216-224'}),
  T('E-GI-02','ems','내과응급','간·담도·췌장 응급','covered',['E25-C01'],{evidence:'2026-NFA-EMS-217-224'}),
  T('E-GU-01','ems','내과응급','비뇨생식기계 응급','covered',['E25-C02'],{evidence:'2026-exam-scope+2026-NFA-EMS-217-224+435-437'}),
  T('E-HEMA-01','ems','내과응급','조혈계 응급','covered',['E25-C03'],{evidence:'2026-exam-scope+2026-NFA-EMS-66+227+KDCA-anemia-platelet'}),
  T('E-ENT-01','ems','내과응급','눈·귀·코·목 응급','covered',['E25-C04'],{evidence:'2026-exam-scope+2026-NFA-EMS-105+435+KDCA-epistaxis-corneal-burn'}),
  T('E-MSK-MED-01','ems','내과응급','비외상성 근골격계 응급','covered',['E25-C05'],{evidence:'2026-exam-scope+2026-NFA-EMS-390-394+KDCA-osteoarthritis-gout'}),
  T('E-INF-01','ems','내과응급','패혈증·감염성 응급','covered',['E03-C04'],{evidence:'2026-NFA-EMS-38-43+324+KDCA-sepsis-6755+KDCA-2024-sepsis-guideline'}),
  T('E-TOX-01','ems','중독·알레르기','중독유형·toxidrome·해독제·아나필락시스','covered',['E18-C01','E18-C02'],{evidence:'2026-NFA-EMS-14+315-319+KDCA-poisoning-6316+KDCA-anaphylaxis-6684+EGEN-organophosphate'}),
  T('E-ENV-01','ems','특수응급','한랭·열·익수·물림·쏘임','covered',['E19-C01','E19-C02','E19-C03','E19-C04','E19-C05']),
  T('E-OB-01','ems','산과','임신·정상분만·합병증·산과응급','covered',['E20-C01','E20-C02','E20-C03','E20-C04','E20-C05','E20-C06']),
  T('E-PED-01','ems','소아','소아 평가·기도·호흡·내과·외상','covered',['E21-C01','E21-C02','E21-C03','E21-C04','E21-C05','E21-C06','E21-C07','E21-C08']),
  T('E-PALS-01','ems','소아소생','전문소아소생술·소아 서맥/빈맥/쇼크','covered',['E21-C04','E21-C05'],{visual:true}),
  T('E-NRP-01','ems','신생아','신생아소생술 초기평가·환기·압박','covered',['E20-C03'],{visual:true,evidence:'2026-NFA-EMS-350-352-364-newborn-resuscitation'}),
  T('E-GER-01','ems','노인','노인 생리·접근·평가·다약제','covered',['E22-C01','E22-C02','E22-C03']),
  T('E-BEH-01','ems','행동응급','행동응급·자살위험·폭력·기록','covered',['E23-C01','E23-C02','E23-C03'])
];
const statusRank={missing:0,partial:1,covered:2};
function audit(){
  const rows=topics.map(t=>{
    const present=(t.refs||[]).filter(id=>!!V.curriculum?.byId?.[id]);
    const packs=present.filter(id=>!!V.contentPacks?.authored?.[id]);
    const verified=packs.filter(id=>V.contentPacks.authored[id]?.status==='verified');
    const questions=present.reduce((n,id)=>n+(V.QuestionQuality119?.forConcept?.(id)||[]).length,0);
    return{...t,present:present.length,packs:packs.length,verified:verified.length,questions};
  });
  const count=s=>rows.filter(x=>x.status===s).length;
  const weighted=rows.reduce((n,x)=>n+statusRank[x.status],0);
  return{
    version:'119-coverage-map-2026-2027-v1',
    total:rows.length,
    covered:count('covered'),
    partial:count('partial'),
    missing:count('missing'),
    implementationPercent:Math.round(weighted/(rows.length*2)*100),
    calcTotal:rows.filter(x=>x.calc).length,
    calcMissing:rows.filter(x=>x.calc&&x.status==='missing').map(x=>x.id),
    visualMissing:rows.filter(x=>x.visual&&x.status==='missing').map(x=>x.id),
    rows
  };
}
V.CoverageMap119={
  version:'119-coverage-map-2026-2027-v1',
  basis:{
    official:['2026 소방공무원 채용시험 시행계획','2026 중앙소방학교 공개 교재'],
    trend:['2024 소방학개론 복원/총평','2025 소방학개론 총평','2026 소방학개론 총평','2024 응급처치학개론 복원','2025 응급처치학개론 복원/최근 3개년 분석'],
    policy:'공식범위와 공식교재가 우선이며, 최근기출/총평은 우선순위 태그에만 사용. 확인되지 않은 출제확률은 생성하지 않음.'
  },
  topics,audit
};
})();
;
;

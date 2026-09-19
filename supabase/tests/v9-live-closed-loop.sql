-- AI과외 v9 live closed-loop RLS contract.
-- Uses the two Study test users already created in the shared Staging Auth project.
-- The probe creates only __liveqa_* / __LIVEQA_* rows and deletes all of them before exit.
-- It must be run only against a non-production Study test environment.

do $$
declare
  a uuid;
  b uuid;
begin
  select id into a from auth.users
   where raw_user_meta_data->>'app_scope'='study-v9'
   order by created_at,id limit 1;
  select id into b from auth.users
   where raw_user_meta_data->>'app_scope'='study-v9'
   order by created_at,id offset 1 limit 1;

  if a is null or b is null or a=b then
    raise exception 'STUDY_LIVE_CLOSED_LOOP_NEEDS_TWO_USERS';
  end if;

  delete from public.study_document_chunks where id like '__liveqa_%';
  delete from public.study_private_documents where id like '__liveqa_%';
  delete from public.study_personal_notes where id like '__liveqa_%';
  delete from public.study_user_answers where id like '__liveqa_%';
  delete from public.study_wrong_answers where id like '__liveqa_%';
  delete from public.study_sessions where id like '__liveqa_%';
  delete from public.study_exam_history where id like '__liveqa_%';
  delete from public.study_user_progress where concept_id like '__LIVEQA_%';
  delete from public.study_review_schedule where concept_id like '__LIVEQA_%';

  begin
    execute 'set local role authenticated';
    perform set_config('request.jwt.claim.sub', a::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);

    if (select count(*) from public.study_profiles) <> 1 then raise exception 'A_PROFILE_READ_FAILED'; end if;
    if (select count(*) from public.study_tutor_preferences) <> 1 then raise exception 'A_TUTOR_READ_FAILED'; end if;

    insert into public.study_user_progress(user_id,concept_id,mastery,attempts,correct_count,dangerous_wrong,last_study,next_review)
    values(a,'__LIVEQA_PROGRESS__',77,3,2,1,now(),now()+interval '1 day');

    insert into public.study_user_answers(id,user_id,question_id,concept_id,scope_id,subject,choice,correct,confidence,response_ms)
    values('__liveqa_answer_a__',a,'__liveqa_q__','__LIVEQA_PROGRESS__','F01','fire',2,true,'sure',1234);

    insert into public.study_wrong_answers(id,user_id,question_id,concept_id,confidence,due_at,interval_days,resolved,wrong_count,last_wrong_at)
    values('__liveqa_wrong_a__',a,'__liveqa_q_wrong__','__LIVEQA_PROGRESS__','sure',now()+interval '1 day',1,false,2,now());

    insert into public.study_review_schedule(user_id,concept_id,due_at,interval_days,mastery)
    values(a,'__LIVEQA_REVIEW__',now()+interval '2 days',2,55);

    insert into public.study_personal_notes(id,user_id,title,body,source_type,private)
    values('__liveqa_note_a__',a,'Live QA','private A','manual',true);

    insert into public.study_private_documents(id,user_id,title,file_name,mime_type,page_count,source_hash,storage_path,sync_original)
    values('__liveqa_doc_a__',a,'Live QA Doc','qa.txt','text/plain',1,'__liveqa_hash_a__',null,false);

    insert into public.study_document_chunks(id,user_id,document_id,page_no,chunk_index,body)
    values('__liveqa_chunk_a__',a,'__liveqa_doc_a__',1,0,'private extracted A');

    insert into public.study_sessions(id,user_id,concept_id,started_at,ended_at,duration_sec)
    values('__liveqa_session_a__',a,'__LIVEQA_PROGRESS__',now()-interval '10 minutes',now(),600);

    insert into public.study_exam_history(id,user_id,mode,score,fire_correct,ems_correct,total_answered)
    values('__liveqa_exam_a__',a,'practice',80,8,8,20);

    if (select count(*) from public.study_user_progress where concept_id='__LIVEQA_PROGRESS__') <> 1 then raise exception 'A_PROGRESS_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_user_answers where id='__liveqa_answer_a__') <> 1 then raise exception 'A_ANSWER_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_wrong_answers where id='__liveqa_wrong_a__') <> 1 then raise exception 'A_WRONG_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_review_schedule where concept_id='__LIVEQA_REVIEW__') <> 1 then raise exception 'A_REVIEW_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_personal_notes where id='__liveqa_note_a__') <> 1 then raise exception 'A_NOTE_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_private_documents where id='__liveqa_doc_a__') <> 1 then raise exception 'A_DOC_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_document_chunks where id='__liveqa_chunk_a__') <> 1 then raise exception 'A_CHUNK_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_sessions where id='__liveqa_session_a__') <> 1 then raise exception 'A_SESSION_ROUNDTRIP_FAILED'; end if;
    if (select count(*) from public.study_exam_history where id='__liveqa_exam_a__') <> 1 then raise exception 'A_EXAM_ROUNDTRIP_FAILED'; end if;

    perform set_config('request.jwt.claim.sub', b::text, true);

    if (select count(*) from public.study_profiles) <> 1 then raise exception 'B_PROFILE_SELF_READ_FAILED'; end if;
    if (select count(*) from public.study_tutor_preferences) <> 1 then raise exception 'B_TUTOR_SELF_READ_FAILED'; end if;
    if (select count(*) from public.study_user_progress where concept_id='__LIVEQA_PROGRESS__') <> 0 then raise exception 'B_CAN_READ_A_PROGRESS'; end if;
    if (select count(*) from public.study_user_answers where id='__liveqa_answer_a__') <> 0 then raise exception 'B_CAN_READ_A_ANSWER'; end if;
    if (select count(*) from public.study_wrong_answers where id='__liveqa_wrong_a__') <> 0 then raise exception 'B_CAN_READ_A_WRONG'; end if;
    if (select count(*) from public.study_review_schedule where concept_id='__LIVEQA_REVIEW__') <> 0 then raise exception 'B_CAN_READ_A_REVIEW'; end if;
    if (select count(*) from public.study_personal_notes where id='__liveqa_note_a__') <> 0 then raise exception 'B_CAN_READ_A_NOTE'; end if;
    if (select count(*) from public.study_private_documents where id='__liveqa_doc_a__') <> 0 then raise exception 'B_CAN_READ_A_DOC'; end if;
    if (select count(*) from public.study_document_chunks where id='__liveqa_chunk_a__') <> 0 then raise exception 'B_CAN_READ_A_CHUNK'; end if;
    if (select count(*) from public.study_sessions where id='__liveqa_session_a__') <> 0 then raise exception 'B_CAN_READ_A_SESSION'; end if;
    if (select count(*) from public.study_exam_history where id='__liveqa_exam_a__') <> 0 then raise exception 'B_CAN_READ_A_EXAM'; end if;

    begin
      insert into public.study_personal_notes(id,user_id,title,body,source_type,private)
      values('__liveqa_cross__',a,'forbidden','cross owner','manual',true);
      raise exception 'B_CAN_INSERT_FOR_A';
    exception when insufficient_privilege then null;
    end;

    execute 'reset role';
  exception when others then
    begin execute 'reset role'; exception when others then null; end;
    raise;
  end;

  delete from public.study_document_chunks where id like '__liveqa_%';
  delete from public.study_private_documents where id like '__liveqa_%';
  delete from public.study_personal_notes where id like '__liveqa_%';
  delete from public.study_user_answers where id like '__liveqa_%';
  delete from public.study_wrong_answers where id like '__liveqa_%';
  delete from public.study_sessions where id like '__liveqa_%';
  delete from public.study_exam_history where id like '__liveqa_%';
  delete from public.study_user_progress where concept_id like '__LIVEQA_%';
  delete from public.study_review_schedule where concept_id like '__LIVEQA_%';
end
$$;

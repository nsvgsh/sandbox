## Request: Decouple Free Trial Level-Up Modal from TaskId

### WHAT
- Free Trial в модалке уровня должен работать без привязки к `task_id`.
- Модалка открывает редирект на партнёра по уровню (level-based), клики логируются как конверсии.
- Earn остаётся источником «задач» (`task_definitions`) и клейма.

### WHY
- Модалка не является задачей по продуктовой логике; текущая зависимость от `task_id` создаёт путаницу.
- Хотим единообразную аналитику с явными плейсментами и независимыми кликами с уникальными click id.

### ACCEPTANCE
- На level-up показывается Free Trial modal (если включено в `level_offer_schedule`) и по кнопке выполняется переход на новый endpoint `/api/v1/offer/free-trial/level/{level}/modal-redirect`.
- Клик в модалке создаёт запись в `ad_events` с `provider='free_trial'`, `placement='level_up_modal'`, уникальным `impressionId`.
- Earn tile Free Trial остаётся задачей: клик логируется с `placement='earn_tile'`, `intent='task:<task_id>'`; клейм работает как сейчас.
- Никакой зависимости модалки от `task_id`.



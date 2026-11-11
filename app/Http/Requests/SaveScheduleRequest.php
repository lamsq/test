<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Validator;

class SaveScheduleRequest extends ScheduleRangeRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'publish' => ['required', 'boolean'],
            'changes' => ['present', 'array', 'max:5000'],
            'changes.*' => ['array:user_id,shift_date,start_time,end_time'],
            'changes.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'changes.*.shift_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date', 'before_or_equal:end_date'],
            'changes.*.start_time' => ['present', 'nullable', 'required_with:changes.*.end_time', 'date_format:H:i'],
            'changes.*.end_time' => ['present', 'nullable', 'required_with:changes.*.start_time', 'date_format:H:i', 'after:changes.*.start_time'],
        ];
    }

    public function after(): array
    {
        return [...parent::after(), function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $keys = collect($this->input('changes'))->map(fn (array $change): string => $change['user_id'].'/'.$change['shift_date']);

            if ($keys->unique()->count() !== $keys->count()) {
                $validator->errors()->add('changes', 'Для сотрудника можно передать только одну смену на дату.');
            }
        }];
    }

    public function messages(): array
    {
        return [
            'changes.*.end_time.after' => 'Конец смены должен быть позже начала.',
            'changes.*.user_id.exists' => 'Сотрудник не найден. Обновите график.',
            'changes.*.start_time.required_with' => 'Укажите начало смены.',
            'changes.*.end_time.required_with' => 'Укажите конец смены.',
        ];
    }
}

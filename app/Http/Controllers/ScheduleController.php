<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveScheduleRequest;
use App\Http\Requests\ScheduleRangeRequest;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(ScheduleRangeRequest $request): JsonResponse
    {
        return $this->schedule($request->validated('start_date'), $request->validated('end_date'));
    }

    public function update(SaveScheduleRequest $request): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            User::query()->whereIn('id', array_column($data['changes'], 'user_id'))
                ->orderBy('id')->lockForUpdate()->get(['id']);

            foreach ($data['changes'] as $change) {
                Shift::query()
                    ->where('user_id', $change['user_id'])
                    ->whereDate('shift_date', $change['shift_date'])
                    ->delete();

                if ($change['start_time'] !== null) {
                    Shift::create([...$change, 'published_at' => null]);
                }
            }

            if ($data['publish']) {
                Shift::query()
                    ->whereBetween('shift_date', [$data['start_date'], $data['end_date']])
                    ->update(['published_at' => now()]);
            }
        });

        return $this->schedule($data['start_date'], $data['end_date']);
    }

    private function schedule(string $startDate, string $endDate): JsonResponse
    {
        return response()->json([
            'users' => User::query()->orderBy('surname')->orderBy('name')->get(['id', 'name', 'surname', 'photo']),
            'shifts' => Shift::query()->whereBetween('shift_date', [$startDate, $endDate])->orderBy('id')->get()
                ->map(fn (Shift $shift): array => [
                    'id' => $shift->id,
                    'user_id' => $shift->user_id,
                    'shift_date' => $shift->shift_date->toDateString(),
                    'start_time' => substr($shift->start_time, 0, 5),
                    'end_time' => substr($shift->end_time, 0, 5),
                    'published_at' => $shift->published_at?->toIso8601String(),
                ]),
        ]);
    }
}

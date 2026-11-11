<?php

use App\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('schedule', ['page' => 'home']);
})->name('home');

Route::get('/shifts', function () {
    return view('schedule', ['page' => 'shifts']);
})->name('shifts');

Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
Route::put('/schedule', [ScheduleController::class, 'update'])->name('schedule.update');

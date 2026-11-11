<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#f2f3f7">
    <title>{{ $page === 'home' ? 'Главная' : 'График смен' }} · CRM</title>
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
</head>
<body>
    <div id="app"
         data-page="{{ $page }}"
         data-home-url="{{ route('home', absolute: false) }}"
         data-shifts-url="{{ route('shifts', absolute: false) }}"
         data-endpoint="{{ route('schedule.index', absolute: false) }}"></div>
    <noscript>Для работы с графиком включите JavaScript в браузере.</noscript>
</body>
</html>

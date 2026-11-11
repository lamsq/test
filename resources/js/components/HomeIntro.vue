<template>
    <section class="intro" aria-labelledby="heading">
        <h1 id="heading">Проект для управления сменами</h1>
        <p>график смен с возможностью добавления, изменения, публикации смен, просмотора по неделям и месяцам, подсчету количества смен.</p>
    </section>
</template>

<style scoped>

.intro {
    width: 100%;
    max-width: 820px;
    text-align: center;
}

.intro h1 {
    margin: 0;
    color: #5c5c5c;
    font-size: 2rem;
    font-weight: bold;
    text-wrap: balance;
}

.intro h1::after {
    content: '';
    display: block;
    width: 300px;
    height: 5px;
    margin: 2rem auto;
    border-radius: 5px;
    background: #d9d9d9;
}

.intro p {
    margin: 0;
    color: #7a7a7a;
    font-size: 1.5rem;
    font-weight: lighter;
    text-wrap: balance;
}

</style>

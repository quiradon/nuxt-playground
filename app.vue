<template>
    <div>
        <NuxtPage/>
    </div>
</template>

<script setup lang="js">

const route = useRoute()





useSeoMeta({
    ogUrl: 'https://rpg.arkanus.app'+route.path,
    })
</script>
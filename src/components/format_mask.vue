<template>
<span>
    {{ value }} Mask
</span>
</template>

<script>
export default {
    name: "FormatMask",
    props: {
        amount: {
            type: Number,
            required: true
        },
        round: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        value () {
            let value = this.amount / 1e12
            if(this.round)
                value = value.toFixed(3)
            return value.toLocaleString()
        }

    }
}
</script>

<style>
</style>

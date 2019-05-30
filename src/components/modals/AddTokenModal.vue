<template>
    <b-modal>
        <b-card>
            <b-input type="text" v-model="receiverAddress" placeholder="Loom Address"></b-input>
            <b-button type="button" >Transfer</b-button>
        </b-card>
    </b-modal>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
@Component

export default class TransferTokensFormModal extends Vue{
}
</script>

<style>
</style>

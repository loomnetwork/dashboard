<template>
  <div>
    <b-input-group size="sm">
      <b-input-group-prepend is-text>
        <fa :icon="['far', 'check-circle']" fixed-width v-show="isConnected"/>
        <fa :icon="['far', 'times-circle']" fixed-width v-show="!isConnected"/>
      </b-input-group-prepend>
      <b-form-input type="url" aria-label="Connection URL" :value="connectionUrl" @change="setUrl">
      </b-form-input>
      <b-input-group-append>
        <b-dropdown variant="dark" size="sm">
          <b-dropdown-item-button v-for="url in allowedUrls"
            :key="url"
            @click="onUrlClicked(url)">
            {{url}}
          </b-dropdown-item-button>
        </b-dropdown>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script lang="ts" src="./connection-status.ts"></script>

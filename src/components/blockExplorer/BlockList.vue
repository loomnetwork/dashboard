<template>
  <div class="position-relative">
    <div>
      <b-row class="block-heading">
        <b-col>
          <h1 class="page-header">
            {{ $t('components.blockExplorer.block_list.blocks') }} <fa v-if="isBusy"
                       icon="spinner"
                       class="spinner"
                       spin/>
          </h1>
        </b-col>
        <b-col>
          <div class="block-search-query d-flex flex-row align-items-center">
            <fa :icon="['fas', 'search']" class="search-icon text-grey" fixed-width/>
            <label for="sq-block-height" class="height-label text-grey">{{ $t('components.blockExplorer.block_list.block_height') }}</label>
            <b-form-input id="sq-block-height"
                          class="custom-input fieldheight-input bg-light"
                          type="number"
                          @keypress.enter.native="searchWithBlockHeight"
                          v-model="blockHeight">
            </b-form-input>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="table-container">
            <b-table ref="blocksTable"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              :no-provider-sorting="true"
              :show-empty="true"
              :items="blocks"
              :fields="fields"
              :hover="true"
              :head-variant="muted"
              @row-clicked="onRowClicked"
              :current-page="currentPage"
              :per-page="perPage"
              :busy.sync="isBusy"
              class="custom-table">
              <template slot="blockHeight" slot-scope="row">
                <span>{{ $t('components.blockExplorer.block_list.row_value', {rowValue: row.value }) }}</span>
              </template>
              <template slot="hash" slot-scope="row">
                <span class="text-info hash-value" :title="row.value">{{ row.value }}</span>
              </template>
              <template slot="age" slot-scope="row">
                <span>{{ row.value }}</span>
              </template>
              <template slot="time" slot-scope="row">
                <span>{{ row.value }}</span>
              </template>
            </b-table>
            <div class="d-flex flex-row">
            <!-- <ConnectionStatus v-if="showConnectionDropdown" class="connection-status"
              :blockchain="blockchain"
              @urlClicked="onConnectionUrlChanged"
              @urlInput="onUserInputUrl"/> -->
            <b-pagination
              v-model="currentPage"
              size="sm"
              :total-rows="totalNumBlocks"
              :per-page="perPage"
              :align="paginationAlignment"
              first-text=""
              last-text=""
              prev-text=""
              next-text=""
              />
            </div>
          </div>
        </b-col>
      </b-row>
    </div>

    <div class="block-info-overlay" :class="{ show: isBlockInfoVisible }">
      <BlockInfo class="block-info-card" v-bind="blockInfoProps"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/app.scss';

.block-heading {
  align-items: center;
  h2 {
    position: relative;
    font-size: 25px;
    padding: 24px 36px 24px 0;
    font-weight: 300;
    line-height: 0.88;
    letter-spacing: 0.7px;
    text-align: left;
    color: theme-color('primary');
    display: inline-block;
    margin: 0 auto;
  }
  svg {
    font-size: 16px;
    margin-right: 2px;
  }
  .height-label {
    font-size: 18px;
    margin-bottom: 0px;
    margin-right: 12px;
    font-size: 18px;
  }
  input {
    width: 220px;
  }
}

.spinner {
  position: absolute;
  top: 22px;
  right: 0px;
}

.block-search-query {
  float: right;
}

// header bar
.section-header {
  padding: 26px 0;
  @include normal-font();

  .bg-dark {
    width: 100%;
    height: 26px;
    padding: 0;
    line-height: 25px;
    div {
      display: inline-block;
      padding: 0;
    }
  }

  .header-logo {
    width: 20%;
    a {
      color: $blue2;
      font-size: 25px;
      font-weight: 300;
      text-align: left;
      &:hover {
        text-decoration: none;
      }
    }
  }

  .header-profile {
    text-align: right;
    float: right;
    padding-right: 20px !important;
    .user-head {
      height: 38px;
      width: auto;
      margin-right: 10px;
    }
  }
}

.block-info-overlay {
  position: absolute;
  z-index: 100;
  top: 0;
  right: calc(-50%);
  width: 0;
  height: 100%;
  // slide-in/out the overlay from the right
  transition-property: right, width;
  transition-duration: 0.3s;

  &.show {
    right: -17px; // fix the right margin
    width: 50%;
  }
}

.block-info-card {
  width: 100%;
  height: 100%;

  background-color: $black2;
}

.connection-status {
  width: 400px;
  flex: none;
}

.pagination {
  flex: 1 1 auto;
}

.down-arrow {
  background: url('../../assets/images/down_gray_arrow.svg') no-repeat center;
  width: 18px;
  height: 9px;
}

.loom-logo {
  background: url('../../assets/images/loom_logo.svg') no-repeat center;
  width: 32px;
  height: 28px;
  vertical-align: top;
}
</style>

<script lang="ts" src="./block-list.ts">
</script>

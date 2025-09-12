import { useState } from 'react'
import { BulkCampaignService } from '../lib/bulkCampaignService'
import type { BulkOperationResult } from '../lib/bulkCampaignService'

export interface UseBulkCampaignOperationsReturn {
  loading: boolean
  addAllLists: (
    campaignId: string,
    availableLists: any[],
    currentSelectedLists: string[],
    currentIgnoredLists: string[],
    currentLeads: any[]
  ) => Promise<BulkOperationResult>
  removeAllLists: (
    campaignId: string,
    currentIgnoredLists: string[]
  ) => Promise<BulkOperationResult>
}

export const useBulkCampaignOperations = (): UseBulkCampaignOperationsReturn => {
  const [loading, setLoading] = useState(false)

  const addAllLists = async (
    campaignId: string,
    availableLists: any[],
    currentSelectedLists: string[],
    currentIgnoredLists: string[],
    currentLeads: any[]
  ): Promise<BulkOperationResult> => {
    setLoading(true)
    try {
      const result = await BulkCampaignService.addAllListsToCampaign(
        campaignId,
        availableLists,
        currentSelectedLists,
        currentIgnoredLists,
        currentLeads
      )
      return result
    } finally {
      setLoading(false)
    }
  }

  const removeAllLists = async (
    campaignId: string,
    currentIgnoredLists: string[]
  ): Promise<BulkOperationResult> => {
    setLoading(true)
    try {
      const result = await BulkCampaignService.removeAllListsFromCampaign(
        campaignId,
        currentIgnoredLists
      )
      return result
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    addAllLists,
    removeAllLists
  }
}

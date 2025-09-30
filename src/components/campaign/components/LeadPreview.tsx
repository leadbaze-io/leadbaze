/**
 * =====================================================
 * COMPONENTE LEAD PREVIEW - PREVIEW DE LEAD
 * =====================================================
 */

import React from 'react'
import { motion } from 'framer-motion'
import { X, Phone, Mail, Building, MapPin } from 'lucide-react'

import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import type { CampaignLead } from '../../../types/campaign'

interface LeadPreviewProps {
  leads: CampaignLead
  onClose: () => void
}

export const LeadPreview: React.FC<LeadPreviewProps> = ({
  leads,
  onClose
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview do Lead</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-primary mb-2">{leads.name}</h3>

              {leads.phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone className="w-4 h-4" />
                  <span>{leads.phone}</span>
                </div>
              )}

              {leads.email && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Mail className="w-4 h-4" />
                  <span>{leads.email}</span>
                </div>
              )}

              {leads.company && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Building className="w-4 h-4" />
                  <span>{leads.company}</span>
                </div>
              )}

              {leads.position && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-base font-semibold text-blue-700 dark:text-blue-300">{leads.position}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
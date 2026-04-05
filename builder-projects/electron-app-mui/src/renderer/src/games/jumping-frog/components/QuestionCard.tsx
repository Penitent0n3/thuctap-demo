import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { JumpingFrogAnswer, JumpingFrogQuestion } from '../../../types'

export interface QuestionCardProps {
  question: JumpingFrogQuestion
  index: number
  autoFocus: boolean
  onUpdate: (id: string, patch: Partial<JumpingFrogQuestion>) => void
  onDelete: (id: string) => void
  onAddAnswer: (qid: string) => void
  onUpdateAnswer: (qid: string, aid: string, patch: Partial<JumpingFrogAnswer>) => void
  onDeleteAnswer: (qid: string, aid: string) => void
}

export function QuestionCard({
  question,
  index,
  autoFocus,
  onUpdate,
  onDelete,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer
}: QuestionCardProps): React.ReactElement {
  const hasCorrectAnswer = question.answers.some((a) => a.isCorrect)

  return (
    <Box
      sx={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3,
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden'
      }}
    >
      {/* ── Card Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.03)'
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}
        >
          Question {index + 1}
        </Typography>
        <Tooltip title="Delete question">
          <IconButton
            size="small"
            onClick={() => onDelete(question.id)}
            sx={{ color: 'error.main', opacity: 0.5, '&:hover': { opacity: 1 } }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Question Text ── */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Question"
          size="small"
          fullWidth
          value={question.question}
          onChange={(e) => onUpdate(question.id, { question: e.target.value })}
          placeholder="e.g. What is 2 + 2?"
          error={!question.question.trim()}
          helperText={!question.question.trim() ? 'Required' : ''}
          autoFocus={autoFocus}
        />

        {/* ── Answers ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="overline"
            sx={{ fontSize: '0.6rem', letterSpacing: 2, color: 'text.disabled' }}
          >
            Options — click the icon to mark as correct
          </Typography>

          {question.answers.map((answer, aIdx) => {
            const isCorrect = answer.isCorrect
            const Icon = isCorrect ? CheckCircleIcon : RadioButtonUncheckedIcon

            return (
              <Box key={answer.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={isCorrect ? 'Correct (click to toggle)' : 'Mark as correct'}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      onUpdateAnswer(question.id, answer.id, { isCorrect: !isCorrect })
                    }
                    sx={{
                      color: isCorrect ? 'success.main' : 'text.disabled',
                      flexShrink: 0
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <TextField
                  size="small"
                  fullWidth
                  value={answer.text}
                  onChange={(e) => onUpdateAnswer(question.id, answer.id, { text: e.target.value })}
                  placeholder={`Option ${String.fromCharCode(64 + aIdx + 1)}…`}
                  error={!answer.text.trim()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderColor: isCorrect ? 'success.main' : undefined,
                      '& fieldset': { borderColor: isCorrect ? 'rgba(52,211,153,0.4)' : undefined }
                    }
                  }}
                />

                <Tooltip title="Remove option">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteAnswer(question.id, answer.id)}
                      disabled={question.answers.length <= 2}
                      sx={{
                        color: 'error.main',
                        opacity: 0.5,
                        '&:hover': { opacity: 1 },
                        '&.Mui-disabled': { opacity: 0.2 }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )
          })}

          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onAddAnswer(question.id)}
            sx={{ alignSelf: 'flex-start', mt: 0.5, opacity: 0.7 }}
          >
            Add option
          </Button>

          {!hasCorrectAnswer && question.answers.length > 0 && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.25 }}>
              ⚠ No correct answer marked
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

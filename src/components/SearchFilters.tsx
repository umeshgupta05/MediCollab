import React from 'react';
import {
  Paper,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Slider,
  Button,
} from '@mui/material';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  categories: string[];
  tags: string[];
  dateRange?: boolean;
  sortOptions?: { label: string; value: string }[];
  placeholder?: string;
}

export default function SearchFilters({
  query,
  onQueryChange,
  filters,
  onFilterChange,
  categories,
  tags,
  dateRange = false,
  sortOptions,
  placeholder = 'Search...',
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleDateRangeChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onFilterChange({
        ...filters,
        dateRange: newValue,
      });
    }
  };

  const clearFilters = () => {
    onFilterChange({});
    onQueryChange('');
  };

  return (
    <Paper className="p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <TextField
            fullWidth
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            sx={{ '& .MuiInputBase-root': { paddingLeft: '2.5rem' } }}
          />
        </div>
        <Button
          variant="outlined"
          startIcon={<Filter size={16} />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
        {(query || Object.keys(filters).length > 0) && (
          <Button
            variant="text"
            startIcon={<X size={16} />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category || ''}
                label="Category"
                onChange={(e) =>
                  onFilterChange({ ...filters, category: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={tags}
              value={filters.tags || []}
              onChange={(_, newValue) =>
                onFilterChange({ ...filters, tags: newValue })
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Select tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {sortOptions && (
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy || ''}
                  label="Sort By"
                  onChange={(e) =>
                    onFilterChange({ ...filters, sortBy: e.target.value })
                  }
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>

          {dateRange && (
            <div className="pt-4">
              <Typography gutterBottom>Date Range</Typography>
              <Slider
                value={filters.dateRange || [0, 100]}
                onChange={handleDateRangeChange}
                valueLabelDisplay="auto"
                aria-labelledby="date-range-slider"
              />
            </div>
          )}
        </div>
      )}
    </Paper>
  );
}
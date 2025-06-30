<script setup lang="ts">
interface TimelineEvent {
  id: string
  type: 'created' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  title: string
  description: string
  datetime: string
}

interface Props {
  timeline: TimelineEvent[]
}

defineProps<Props>()

// Format datetime function (you can use from your composable)
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="bg-white rounded-lg border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
    
    <div class="flow-root">
      <ul role="list" class="-mb-8">
        <li v-for="(event, eventIdx) in timeline" :key="event.id" class="relative pb-8">
          <div v-if="eventIdx !== timeline.length - 1" class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
          
          <div class="relative flex space-x-3">
            <div>
              <span :class="[
                event.type === 'created' ? 'bg-blue-500' : 
                event.type === 'confirmed' ? 'bg-green-500' : 
                event.type === 'processing' ? 'bg-yellow-500' : 
                event.type === 'shipped' ? 'bg-purple-500' : 
                event.type === 'delivered' ? 'bg-green-600' : 
                event.type === 'cancelled' ? 'bg-red-500' : 'bg-gray-400',
                'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
              ]">
                <!-- Created Icon -->
                <svg v-if="event.type === 'created'" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                
                <!-- Confirmed Icon -->
                <svg v-else-if="event.type === 'confirmed'" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                
                <!-- Processing Icon -->
                <svg v-else-if="event.type === 'processing'" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                
                <!-- Shipped Icon -->
                <svg v-else-if="event.type === 'shipped'" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z" />
                </svg>
                
                <!-- Delivered Icon -->
                <svg v-else-if="event.type === 'delivered'" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                
                <!-- Default Icon -->
                <svg v-else class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
            
            <div class="flex-1 min-w-0">
              <div>
                <div class="text-sm">
                  <span class="font-medium text-gray-900">{{ event.title }}</span>
                </div>
                <p class="mt-0.5 text-sm text-gray-500">{{ event.description }}</p>
              </div>
              <div class="mt-2 text-sm text-gray-500">
                <time :datetime="event.datetime">{{ formatDateTime(event.datetime) }}</time>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
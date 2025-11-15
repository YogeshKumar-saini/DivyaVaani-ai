"""Base class for pipeline stages."""

from abc import ABC, abstractmethod
from typing import Any
from src.pipeline.models import Collection, PipelineContext, StageResult, StageStatus
from src.utils.logger import log
import time


class PipelineStage(ABC):
    """Base class for all pipeline stages."""
    
    def __init__(self):
        self._start_time: float = 0
        self._end_time: float = 0
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Stage name."""
        pass
    
    @abstractmethod
    def execute(
        self,
        collection: Collection,
        input_data: Any,
        context: PipelineContext
    ) -> StageResult:
        """Execute the stage.
        
        Args:
            collection: Collection being processed
            input_data: Input data from previous stage
            context: Pipeline execution context
            
        Returns:
            StageResult with execution details
        """
        pass
    
    @abstractmethod
    def validate_input(self, input_data: Any) -> bool:
        """Validate input data.
        
        Args:
            input_data: Data to validate
            
        Returns:
            True if valid, False otherwise
        """
        pass
    
    def run(
        self,
        collection: Collection,
        input_data: Any,
        context: PipelineContext
    ) -> StageResult:
        """Run the stage with lifecycle hooks.
        
        Args:
            collection: Collection being processed
            input_data: Input data from previous stage
            context: Pipeline execution context
            
        Returns:
            StageResult with execution details
        """
        log.info(f"Starting stage: {self.name}")
        self._start_time = time.time()
        
        try:
            # Validate input
            if not self.validate_input(input_data):
                error_msg = f"Invalid input data for stage {self.name}"
                log.error(error_msg)
                return StageResult(
                    stage_name=self.name,
                    status=StageStatus.FAILED,
                    input_count=0,
                    output_count=0,
                    execution_time=0,
                    errors=[error_msg]
                )
            
            # Execute stage
            result = self.execute(collection, input_data, context)
            
            # Calculate execution time
            self._end_time = time.time()
            result.execution_time = self._end_time - self._start_time
            
            # Call success hook
            if result.status == StageStatus.COMPLETED:
                self.on_success(result)
                log.info(f"Stage {self.name} completed successfully in {result.execution_time:.2f}s")
            else:
                log.warning(f"Stage {self.name} completed with status: {result.status}")
            
            return result
            
        except Exception as e:
            self._end_time = time.time()
            execution_time = self._end_time - self._start_time
            
            error_msg = f"Stage {self.name} failed: {str(e)}"
            log.error(error_msg, exc_info=True)
            
            # Call failure hook
            self.on_failure(e)
            
            return StageResult(
                stage_name=self.name,
                status=StageStatus.FAILED,
                input_count=0,
                output_count=0,
                execution_time=execution_time,
                errors=[error_msg]
            )
    
    def on_success(self, result: StageResult) -> None:
        """Hook called on successful execution.
        
        Args:
            result: Stage execution result
        """
        pass
    
    def on_failure(self, error: Exception) -> None:
        """Hook called on failure.
        
        Args:
            error: Exception that caused failure
        """
        pass
    
    def __str__(self) -> str:
        """String representation."""
        return f"PipelineStage({self.name})"
    
    def __repr__(self) -> str:
        """Repr representation."""
        return self.__str__()

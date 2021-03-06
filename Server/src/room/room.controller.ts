import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param, Post,
    Put,
    Query,
    Req,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/auth/guards/jwt.guard';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {RoomService} from './room.service';
import {OptionalJWTGuard} from "../auth/guards/optional-jwt.guard";

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) {
    }

    @Post('create')
    create(
        @Body() body: { onlineId: string },
    ) {
        return this.roomService.create(body.onlineId);
    }

    @UseGuards(JwtAuthGuard)
    @Get("actives")
    getActives() {
        const actives = this.roomService.getActives();
        if (Object.keys(actives).length > 0) return actives;
        throw new NotFoundException('Not any active rooms')
    }

    @Get('active/:link')
    getActive(@Param('link') link: string) {
        return this.roomService.findActive(link)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(
        @Body(new ValidationPipe()) body: UpdateRoomDto,
        @Param('id') id: string,
    ) {
        return await this.roomService.updateRoom(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAll(
        @Query('type') type: string,
        @Req()
            req: Partial<{ user: { userId: string; email: string; role: string } }>,
    ) {
        if (type) {
            return await this.roomService.get(req.user.userId, type);
        }
        return await this.roomService.get(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':link')
    async getByLink(@Param('link') link: string) {
        return await this.roomService.getByLink(link);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.roomService.deleteRoom(id);
    }
}
